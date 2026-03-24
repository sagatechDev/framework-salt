# Quickstart

Este é um guia passo a passo em como montar a sua primeira interface ERP utilizando os superpoderes do **Framework Salt**. Em poucos minutos você cobrirá do Roteamento ao Form.

---

## 1. Acesse o Componente

A sua primeira missão ao programar uma função nova é registrar uma Pagina que irá abrigar seu sistema. Esqueça os arquivos `Route` normais e Crie sua classe Livewire importando a trait maravilhosa `IsPage`.

```php
namespace Modules\Fiscal\Pages;

use Livewire\Component;
use Modules\Framework\Concerns\IsPage;

class CreateNfePage extends Component
{
    use IsPage; // 🚀 O superpoder!

    protected static ?string $resource = NfeResource::class;
    
    // Suas regras virão aqui
}
```

## 2. Inserindo Tabelas e Filtros

Quando precisar listar dados do tipo NFe ou Clientes com Filtros Dinâmicos altamente complexos, utilize a Arquitetura de Formulários e os componentes nativos de Tabela.

```php
use Modules\Framework\Components\Money;

public function getFormSchema(): array
{
    return [
        Money::create('Valor Unitário', 'vUnCom')
            ->prefix('R$')
            ->disabled(),
    ];
}
```

## 3. Lógica de Submissão

Seu componente tem botões Salvar/Enviar form? Chame a trait **`CanSubmit`**. Ela magicamente criará Transações Seguras de BD `DB::beginTransaction()` englobando suas submissões e uploads de arquivo:

```php
use Modules\Framework\Concerns\CanSubmit;

class CreateNfePage extends Component
{
    use IsPage, CanSubmit;

    protected function handleSubmit(array $data): Model
    {
        return Nfe::create($data); // Transação automática e com alerta SweetAlert no final!
    }
}
```

## Próximos Passos
Siga pela barra lateral para se aprofundar em cada pilar e aprender como manipular Layouts Colapsáveis no `RepeaterContainer` ou `CollapsibleGroup`.
