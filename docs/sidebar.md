
# Menu lateral

[:arrow_backward: Voltar](../)

O menu lateral é construído a partir de `SidebarItem`s registrados no `SidebarRegistrar`. Cada módulo define sua própria classe de Sidebar e a registra em ordem. O componente Blade `<x-framework::sidebar.sidebar-menu-wrapper />` cuida da renderização.

---

## Criando um item de menu

```php
use Modules\Framework\Components\Sidebar\SidebarItem;

SidebarItem::create('Clientes', 'fa-users')
    ->route('clientes.index')
    ->patterns(['clientes', 'clientes/*'])
    ->permissions(['verClientes']);
```

O primeiro argumento é o rótulo, o segundo o ícone (FontAwesome). O `patterns()` determina quando o item fica destacado como ativo — ele compara os padrões com a URL atual.

---

## Sub-menus

Quando um item tem filhos, ele funciona como um grupo expansível. Basta passar um array de `SidebarItem` para `children()`:

```php
SidebarItem::create('Comercial', 'fa-briefcase')
    ->permissions(['verComercial'])
    ->children([
        SidebarItem::create('Clientes', 'fa-users')
            ->route('clientes.index')
            ->patterns(['clientes', 'clientes/*']),

        SidebarItem::create('Pedidos', 'fa-file-text')
            ->route('pedidos.index')
            ->patterns(['pedidos', 'pedidos/*']),

        SidebarItem::create('Orçamentos', 'fa-calculator')
            ->route('orcamentos.index')
            ->patterns(['orcamentos', 'orcamentos/*']),
    ]);
```

> Um item pai só é exibido se ao menos um filho for visível para o usuário. A ativação do pai é automática quando qualquer filho estiver ativo.

---

## Controle de acesso

As permissões passadas para `permissions()` são verificadas na seguinte ordem:

1. Se o usuário for **Administrador**, sempre vê o item
2. Se existir um **método** com aquele nome no model `User`, ele é chamado
3. Se existir um **Gate** com aquele nome, é verificado via `Gate::allows()`

As permissões do pai são **herdadas pelos filhos** automaticamente. Se o pai exige `'verComercial'`, todos os filhos já estão protegidos por essa permissão.

Para controle mais granular, use `visible()` com uma closure ou nome de gate:

```php
// Visível apenas para administradores
SidebarItem::create('Painel Admin', 'fa-lock')
    ->route('admin.index')
    ->visible(fn() => auth()->user()->isAdministrador());

// Visível apenas se o usuário tem o gate 'verRelatorios'
SidebarItem::create('Relatórios', 'fa-chart-bar')
    ->route('relatorios.index')
    ->visible('verRelatorios');

// Oculto quando o usuário tem a permissão 'ocultarMenu'
SidebarItem::create('Item Especial', 'fa-star')
    ->route('especial.index')
    ->hidden('ocultarMenu');
```

---

## Badge

Para exibir um badge no item (contadores, labels de novidade, etc.):

```php
SidebarItem::create('Notificações', 'fa-bell')
    ->route('notificacoes.index')
    ->badge('3', 'danger');   // badge vermelho
```

Os estilos disponíveis são os mesmos do sistema de badges: `'danger'`, `'warning'`, `'info'`, `'success'`.

---

## Criando a Sidebar de um módulo

A convenção é criar uma classe estática no módulo que retorna o item raiz:

```php
// app-modules/compras/src/ComprasSidebar.php

namespace Modules\Compras;

use Modules\Framework\Components\Sidebar\SidebarItem;

class ComprasSidebar
{
    public static function item(): SidebarItem
    {
        return SidebarItem::create('Compras', 'fa-shopping-cart')
            ->permissions(['verCompras'])
            ->children([
                SidebarItem::create('Requisições', 'fa-list')
                    ->route('requisicoes.index')
                    ->patterns(['requisicoes', 'requisicoes/*']),

                SidebarItem::create('Pedidos de Compra', 'fa-file-text')
                    ->route('pedidos-compra.index')
                    ->patterns(['pedidos-compra', 'pedidos-compra/*']),

                SidebarItem::create('Relatório', 'fa-chart-bar')
                    ->route('compras.relatorio')
                    ->patterns(['compras/relatorio'])
                    ->permissions(['verRelatorioCompras']),
            ]);
    }
}
```

---

## Registrando no SidebarRegistrar

Após criar a classe, adicione-a na ordem correta dentro de `SidebarRegistrar::registerAll()`:

```php
use Modules\Framework\Components\Sidebar\SidebarSeparator;
use Modules\Compras\ComprasSidebar;

public static function registerAll(): array
{
    return [
        SidebarSeparator::create('Menu de Navegação'),

        ClientesSidebar::item(),
        VendasSidebar::item(),
        ComprasSidebar::item(),   // <-- novo módulo aqui

        SidebarSeparator::create('Configurações'),

        ConfiguracoesSidebar::item(),
    ];
}
```

O `SidebarSeparator` exibe um título de seção entre grupos de itens. A ordem dos itens no array determina a ordem no menu.

---

## Detecção de item ativo

Os `patterns` são comparados com a URL atual usando a mesma sintaxe do helper `request()->is()` do Laravel:

```php
->patterns(['clientes'])                        // ativo apenas em /clientes
->patterns(['clientes/*'])                      // ativo em /clientes/qualquer-coisa
->patterns(['clientes', 'clientes/*'])          // ativo em ambos
->patterns(['clientes/*', 'grupo-clientes/*'])  // múltiplos prefixos
```

---

> Veja também: [Resource e Pages](./resource) · [Outros concerns Livewire](./livewire-others)
