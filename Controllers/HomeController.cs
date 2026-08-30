using CrmSystem.Data;
using CrmSystem.DTOs;
using CrmSystem.Models;
using CrmSystem.Services;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrmSystem.Controllers;

public class HomeController : Controller
{
    private readonly ICrmService _crmService;

    public HomeController(ICrmService crmService)
    {
        _crmService = crmService;
    }

    public async Task<IActionResult> Index()
    {
        var ct = CancellationToken.None;
        var allDeals = await _crmService.GetAllDealsAsync(ct);

        var allDealsDto = allDeals
            .Select(o => new AllDealsResponseDto(
                o.Id,
                o.CustomersName,
                o.CustomersPhoneNumber,
                o.Location))
            .OrderByDescending(o => o.Id);

        return View(allDealsDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDeal([FromBody] CreateNewDealRecordDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var newDeal = await _crmService.CreateDealAsync(dto, ct);

        var response = new DealRecordResponseDto(
            newDeal.Id,
            newDeal.CustomersName,
            newDeal.CustomersPhoneNumber,
            newDeal.Location,
            newDeal.Description,
            newDeal.CreatedAt,
            newDeal.NextCall);

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetDeal(int id, CancellationToken ct)
    {
        var deal = await _crmService.GetDealByIdAsync(id, ct);
        if (deal == null)
        {
            return NotFound(new { message = $"Запись не найдена или была удалена."});
        }

        var response = new DealRecordResponseDto(
            deal.Id,
            deal.CustomersName,
            deal.CustomersPhoneNumber,
            deal.Location,
            deal.Description,
            deal.CreatedAt,
            deal.NextCall);
        
        return Ok(response);
    }
}