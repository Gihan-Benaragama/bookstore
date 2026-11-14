using System.Security.Claims;
using Bookstore.Api.DTOs.Cart;
using Bookstore.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookstore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController(ICartService cartService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue("sub")
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Get current user's cart.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCart() => Ok(await cartService.GetCartAsync(UserId));

    /// <summary>Add a book to the cart.</summary>
    [HttpPost]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var item = await cartService.AddToCartAsync(UserId, dto);
        return Ok(item);
    }

    /// <summary>Update quantity of a cart item.</summary>
    [HttpPut("{cartItemId:int}")]
    public async Task<IActionResult> UpdateCartItem(int cartItemId, UpdateCartItemDto dto)
    {
        var item = await cartService.UpdateCartItemAsync(UserId, cartItemId, dto);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Remove a specific item from the cart.</summary>
    [HttpDelete("{cartItemId:int}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var success = await cartService.RemoveFromCartAsync(UserId, cartItemId);
        return success ? NoContent() : NotFound();
    }

    /// <summary>Clear the entire cart.</summary>
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await cartService.ClearCartAsync(UserId);
        return NoContent();
    }
}
