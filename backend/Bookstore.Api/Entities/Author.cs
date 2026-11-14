namespace Bookstore.Api.Entities;

public class Author
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }

    // Navigation property
    public ICollection<Book> Books { get; set; } = [];
}

