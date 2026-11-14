using System.ComponentModel.DataAnnotations;

namespace Bookstore.Api.DTOs.Cart;

public class AddToCartDto
{
    [Required]
    public int BookId { get; set; }

    [Required, Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}

