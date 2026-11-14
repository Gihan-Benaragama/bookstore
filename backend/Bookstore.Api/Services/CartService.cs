using Bookstore.Api.Data;
using Bookstore.Api.DTOs.Cart;
using Bookstore.Api.Entities;
using Bookstore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Api.Services;

public class CartService(AppDbContext db) : ICartService
{
    public async Task<List<CartItemDto>> GetCartAsync(int userId) =>
        await db.CartItems
            .Where(ci => ci.UserId == userId)
            .Include(ci => ci.Book)
            .Select(ci => ToDto(ci))
            .ToListAsync();

    public async Task<CartItemDto> AddToCartAsync(int userId, AddToCartDto dto)
    {
        var book = await db.Books.FindAsync(dto.BookId)
            ?? throw new KeyNotFoundException("Book not found.");

        if (book.Stock < dto.Quantity)
            throw new InvalidOperationException($"Only {book.Stock} copies available.");

        // If the item is already in the cart, increase quantity
        var existing = await db.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.BookId == dto.BookId);

        if (existing is not null)
        {
            existing.Quantity += dto.Quantity;
            await db.SaveChangesAsync();
            await db.Entry(existing).Reference(ci => ci.Book).LoadAsync();
            return ToDto(existing);
        }

        var cartItem = new CartItem
        {
            UserId = userId,
            BookId = dto.BookId,
            Quantity = dto.Quantity
        };

        db.CartItems.Add(cartItem);
        await db.SaveChangesAsync();
        await db.Entry(cartItem).Reference(ci => ci.Book).LoadAsync();
        return ToDto(cartItem);
    }

    public async Task<CartItemDto?> UpdateCartItemAsync(int userId, int cartItemId, UpdateCartItemDto dto)
    {
        var cartItem = await db.CartItems
            .Include(ci => ci.Book)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

        if (cartItem is null) return null;

        if (cartItem.Book.Stock < dto.Quantity)
            throw new InvalidOperationException($"Only {cartItem.Book.Stock} copies available.");

        cartItem.Quantity = dto.Quantity;
        await db.SaveChangesAsync();
        return ToDto(cartItem);
    }

    public async Task<bool> RemoveFromCartAsync(int userId, int cartItemId)
    {
        var cartItem = await db.CartItems
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

        if (cartItem is null) return false;

        db.CartItems.Remove(cartItem);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task ClearCartAsync(int userId)
    {
        var items = db.CartItems.Where(ci => ci.UserId == userId);
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync();
    }

    private static CartItemDto ToDto(CartItem ci) => new()
    {
        Id = ci.Id,
        BookId = ci.BookId,
        BookTitle = ci.Book.Title,
        CoverImageUrl = ci.Book.CoverImageUrl,
        UnitPrice = ci.Book.Price,
        Quantity = ci.Quantity
    };
}

