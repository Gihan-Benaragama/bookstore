namespace Bookstore.Api.Entities;

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // e.g. "Pending", "Shipped", "Delivered", "Cancelled"
    public decimal TotalAmount { get; set; }
    public string? ShippingAddress { get; set; }

    // Foreign key
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}

