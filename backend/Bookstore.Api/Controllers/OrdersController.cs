using System.Security.Claims;
using Bookstore.Api.DTOs.Orders;
using Bookstore.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookstore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue("sub")
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Place an order from the current cart.</summary>
    [HttpPost]
    public async Task<IActionResult> PlaceOrder(PlaceOrderDto dto)
    {
        var order = await orderService.PlaceOrderAsync(UserId, dto);
        return CreatedAtAction(nameof(GetOrder), new { orderId = order.Id }, order);
    }

    /// <summary>Get order history for the current user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetOrderHistory() =>
        Ok(await orderService.GetOrderHistoryAsync(UserId));

    /// <summary>Get a specific order by ID.</summary>
    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var order = await orderService.GetOrderByIdAsync(UserId, orderId);
        return order is null ? NotFound() : Ok(order);
    }
}
