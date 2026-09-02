using CrmSystem.DTOs;
using CrmSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;

namespace CrmSystem.Controllers;

public class HomeController : Controller
{
    private readonly ICrmService _crmService;
    

    public HomeController(ICrmService crmService)
    {
        _crmService = crmService;
    }

    public async Task<IActionResult> Index(CancellationToken ct)
    {
        var allDeals = await _crmService.GetAllDealsAsync(ct);
        var allDealsDto = allDeals.Select(d => new AllDealsResponseDto(
            d.Id,
            d.CustomersName,
            d.CustomersPhoneNumber,
            d.Location,
            d.DateTask))
            .OrderByDescending(d => d.Id);
        return View(allDealsDto);
    }
}