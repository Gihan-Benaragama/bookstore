
namespace Bookstore.Api.Entities;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime PublishedDate { get; set; }

    // Foreign keys
    public int AuthorId { get; set; }
    public int CategoryId { get; set; }

    // Navigation properties
    public Author Author { get; set; } = null!;
    public Category Category { get; set; } = null!;

    public ICollection<CartItem> CartItems { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
