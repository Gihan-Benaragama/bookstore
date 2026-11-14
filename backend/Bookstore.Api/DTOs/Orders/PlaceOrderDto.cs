using System.ComponentModel.DataAnnotations;

namespace Bookstore.Api.DTOs.Orders;

public class PlaceOrderDto
{
    [Required, MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;
}

