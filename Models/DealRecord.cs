namespace CrmSystem.Models;

public class DealRecord{
    public int Id {get; set;}
    public string CustomersName {get; set;} = string.Empty;
    public string CustomersPhoneNumber {get; set;} = string.Empty;
    public string Location {get; set;} = string.Empty;
    public string? Description {get; set;} = string.Empty;
    public DateTime CreatedAt {get; set;}
    public DateTime? NextCall {get; set;}
}