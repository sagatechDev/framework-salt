
# Utilitários

[:arrow_backward: Voltar](../)

---

## TenantRoute — rotas web com tenancy

`TenantRoute::group()` registra um grupo de rotas web com todos os middlewares de tenancy e autenticação já configurados de uma vez só:

```
web · InitializeTenancyBySubdomain · PreventAccessFromCentralDomains · auth · CheckIfUserShouldChangePassword
```

No arquivo de rotas do módulo, use assim:

```php
use Modules\Framework\Utils\TenantRoute;

TenantRoute::group(function () {
    Route::get('/clientes', ClienteListPage::class)->name('clientes.index');
    Route::get('/clientes/criar', ClienteCreatePage::class)->name('clientes.create');
    Route::get('/clientes/{id}/editar', ClienteEditPage::class)->name('clientes.edit');
});
```

Também aceita um caminho de arquivo:

```php
TenantRoute::group(base_path('routes/clientes.php'));
```

---

## ApiTenantRoute — rotas API com tenancy

Igual ao `TenantRoute`, mas para rotas de API. Adiciona o prefixo `/api` automaticamente e usa os middlewares:

```
api · InitializeTenancyBySubdomain · PreventAccessFromCentralDomains
```

```php
use Modules\Framework\Utils\ApiTenantRoute;

ApiTenantRoute::group(function () {
    Route::get('/clientes', [ClienteApiController::class, 'index']);
    Route::post('/clientes', [ClienteApiController::class, 'store']);
    Route::put('/clientes/{id}', [ClienteApiController::class, 'update']);
});
// Disponível em: /api/clientes
```

---

## Number — comparação segura de floats

Comparações diretas de ponto flutuante em PHP são notoriamente imprecisas:

```php
0.1 + 0.2 == 0.3  // false (!)
```

`Number` usa tolerância epsilon (`1e-6` por padrão) para comparar valores de forma segura:

```php
use Modules\Framework\Utils\Number;

Number::from(0.1 + 0.2)->equal(0.3);  // true

// Verificar se saldo está zerado
Number::from($saldo)->equal(0.0);

// Validar que total bate com a soma dos itens
if (Number::from(array_sum($valores))->notEqual($pedido->total)) {
    throw new \Exception('Totais não conferem');
}

// Comparações relacionais
Number::from($desconto)->greaterThan(0.0);
Number::from($desconto)->lessThanOrEqual(200.0);
```

Todos os métodos aceitam `float` ou outra instância de `Number`. Para tolerância customizada (útil em valores grandes), passe o epsilon como segundo argumento:

```php
// Tolerância de 1 centavo
Number::from($totalNota)->equal($totalXml, 0.01);
```

Os métodos disponíveis são: `equal`, `notEqual`, `lessThan`, `greaterThan`, `lessThanOrEqual`, `greaterThanOrEqual`.

---

## BaseRepository — CRUD baseado em DTO

`BaseRepository` fornece `save()` e `delete()` padronizados. O Model **deve** usar o trait `ErpSaga\Eloquent\FromFillable`.

A lógica do `save()` é simples: se `$dto->id` for **int**, executa UPDATE; se for **string** (UUID ou string vazia), executa INSERT.

```php
use Modules\Framework\Repositories\BaseRepository;

class ClienteRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(Cliente::class);
    }
}
```

Usando no Service:

```php
class ClienteService
{
    public function __construct(private ClienteRepository $repo) {}

    public function criar(ClienteDto $dto): void
    {
        $dto->id = '';          // string = INSERT
        $this->repo->save($dto);
        // $dto->id agora tem o ID gerado
    }

    public function atualizar(int $id, ClienteDto $dto): void
    {
        $dto->id = $id;         // int = UPDATE
        $this->repo->save($dto);
    }

    public function deletar(int $id): void
    {
        $this->repo->delete($id);
    }
}
```

O Model precisa do `FromFillable` para que o `save()` filtre apenas os campos do `$fillable`:

```php
use ErpSaga\Eloquent\FromFillable;

class Cliente extends Model
{
    use FromFillable;

    protected $fillable = ['nome', 'email', 'cpf', 'status'];
}
```

---

## Breadcrumb — navegação hierárquica

`Breadcrumb` representa um item na trilha de navegação. A forma mais comum é construir a partir de uma Page existente:

```php
use Modules\Framework\Common\Breadcrumb;

protected function previousBreadcrumbs(): array
{
    return [
        Breadcrumb::fromPage(ClienteListPage::class),
    ];
}
// Resultado: Clientes > Editar Cliente
// O item atual é adicionado automaticamente pelo IsPage com actived=true
```

Para hierarquias mais profundas, empilhe os breadcrumbs:

```php
protected function previousBreadcrumbs(): array
{
    return [
        Breadcrumb::fromPage(PedidoListPage::class),
        Breadcrumb::fromPage(PedidoViewPage::class, [$this->recordId]),
    ];
}
```

---

## ResourceRegistrar — autodiscovery de Resources

O `ResourceRegistrar` varre a aplicação em busca de arquivos `Resource.php` e registra as rotas de cada um automaticamente. Basta chamá-lo no ServiceProvider:

```php
ResourceRegistrar::registerAll();
```

Em produção, use o cache para evitar o discovery em cada request:

```bash
php artisan resources:cache   # gera config/resources.php
php artisan resources:clear   # limpa o cache
```

Para que um Resource seja descoberto automaticamente ele deve:

- Estar dentro de `app/` ou `app-modules/`
- O arquivo deve se chamar **exatamente** `Resource.php`
- Ter uma declaração `namespace` no topo
- Estender `AbstractResource`

```
app-modules/compras/src/ComprasResource.php  ← NÃO descoberto (nome errado)
app-modules/compras/src/Resource.php         ← Descoberto
```

---

> Veja também: [Resource e Pages](./resource) · [Menu lateral](./sidebar)
