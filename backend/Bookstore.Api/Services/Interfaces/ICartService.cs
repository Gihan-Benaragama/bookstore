using Bookstore.Api.DTOs.Cart;

namespace Bookstore.Api.Services.Interfaces;

public interface ICartService
{
    Task<List<CartItemDto>> GetCartAsync(int userId);
    Task<CartItemDto> AddToCartAsync(int userId, AddToCartDto dto);
    Task<CartItemDto?> UpdateCartItemAsync(int userId, int cartItemId, UpdateCartItemDto dto);
    Task<bool> RemoveFromCartAsync(int userId, int cartItemId);
    Task ClearCartAsync(int userId);
}

