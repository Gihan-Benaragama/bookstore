namespace Bookstore.Api.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }  // Price snapshot at time of order

    // Foreign keys
    public int OrderId { get; set; }
    public int BookId { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Book Book { get; set; } = null!;
}

