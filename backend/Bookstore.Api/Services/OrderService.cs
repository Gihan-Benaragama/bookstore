using Bookstore.Api.Data;
using Bookstore.Api.DTOs.Orders;
using Bookstore.Api.Entities;
using Bookstore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Api.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderDto dto)
    {
        var cartItems = await db.CartItems
            .Where(ci => ci.UserId == userId)
            .Include(ci => ci.Book)
            .ToListAsync();

        if (cartItems.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        // Validate stock for all items
        foreach (var item in cartItems)
        {
            if (item.Book.Stock < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{item.Book.Title}'. Available: {item.Book.Stock}.");
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            ShippingAddress = dto.ShippingAddress,
            Status = "Pending",
            OrderDate = DateTime.UtcNow,
            TotalAmount = cartItems.Sum(ci => ci.Book.Price * ci.Quantity)
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(); // get order Id

        // Create order items and reduce stock
        var orderItems = cartItems.Select(ci => new OrderItem
        {
            OrderId = order.Id,
            BookId = ci.BookId,
            Quantity = ci.Quantity,
            UnitPrice = ci.Book.Price
        }).ToList();

        foreach (var ci in cartItems)
            ci.Book.Stock -= ci.Quantity;

        db.OrderItems.AddRange(orderItems);
        db.CartItems.RemoveRange(cartItems);

        await db.SaveChangesAsync();

        return ToDto(order, orderItems, cartItems);
    }

    public async Task<List<OrderDto>> GetOrderHistoryAsync(int userId) =>
        await db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => ToDto(o, o.OrderItems.ToList(), null))
            .ToListAsync();

    public async Task<OrderDto?> GetOrderByIdAsync(int userId, int orderId)
    {
        var order = await db.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        return order is null ? null : ToDto(order, order.OrderItems.ToList(), null);
    }

    private static OrderDto ToDto(Order o, List<OrderItem> items, List<CartItem>? cart) => new()
    {
        Id = o.Id,
        OrderDate = o.OrderDate,
        Status = o.Status,
        TotalAmount = o.TotalAmount,
        ShippingAddress = o.ShippingAddress,
        Items = items.Select(oi => new OrderItemDto
        {
            BookId = oi.BookId,
            BookTitle = oi.Book?.Title ?? cart?.FirstOrDefault(ci => ci.BookId == oi.BookId)?.Book.Title ?? string.Empty,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice
        }).ToList()
    };
}

