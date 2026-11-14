using Bookstore.Api.DTOs.Orders;

namespace Bookstore.Api.Services.Interfaces;

public interface IOrderService
{
    Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderDto dto);
    Task<List<OrderDto>> GetOrderHistoryAsync(int userId);
    Task<OrderDto?> GetOrderByIdAsync(int userId, int orderId);
}

