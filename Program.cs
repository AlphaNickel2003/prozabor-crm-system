using CrmSystem.Models;
using Microsoft.AspNetCore.Localization;
using System.Globalization;
using CrmSystem.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CrmSystem.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

builder.Services.AddScoped<ICrmService, CrmSystem.Services.CrmService>();

var app = builder.Build();

app.UseStaticFiles();

app.UseRouting();
app.MapControllers();
app.UseRequestLocalization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();