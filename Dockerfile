FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TaskManagement.Api/TaskManagement.Api.csproj TaskManagement.Api/
RUN dotnet restore TaskManagement.Api/TaskManagement.Api.csproj

COPY TaskManagement.Api/ TaskManagement.Api/
WORKDIR /src/TaskManagement.Api
RUN dotnet publish TaskManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "TaskManagement.Api.dll"]