namespace Bookstore.Api.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation property
    public ICollection<Book> Books { get; set; } = [];
}

