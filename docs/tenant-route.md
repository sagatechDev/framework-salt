# Sistema de Roteamento SaaS (TenantRoute)

O framework resolve dores latentes sobre autenticação, subdomínios (Tenancy Multi-banco) e reset de segurança (Mudar Senhas por exigência) de uma forma extremamente elegante através do utilitário `TenantRoute`.

Localizado em `app-modules/framework/src/Utils/TenantRoute.php`, ele age como um forte _wrapper_ para o sistema de Rotas nativas.

## A Solução Prática Elegante

Sempre que criar um módulo novo e for configurar o `routes/web.php` do seu módulo, apenas puxe o `TenantRoute::group`.

```php
use Modules\Framework\Utils\TenantRoute;
use Modules\Products\Pages\ListProductsPage;

TenantRoute::group(function () {
    ListProductsPage::route('/produtos')->name('products.index');
});
```

Esse simples helper empacota automaticamente debaixo do capô:
- `web`
- `InitializeTenancyBySubdomain`
- `PreventAccessFromCentralDomains`
- `auth`
- `CheckIfUserShouldChangePassword`
