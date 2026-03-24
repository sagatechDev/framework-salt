# Livewire Pages (`IsPage`)

O Trait `IsPage` (`Modules\Framework\Concerns\IsPage`) é o alicerce fundamental para a construção de telas complexas no Salt. Ele unifica quase todas as dependências de página (Livewire, SweetAlert, Autorização, Tabelas, Modais) evitando que você precise importar dezenas de classes em toda nova view.

## O que ele resolve?

Ao utilizar `use IsPage;` em um componente Livewire, ele instantaneamente:
1. Adiciona suporte a rotas estáticas `::route($path)` no registro de módulo;
2. Configura a breadcrumb (navegação superior) `->breadcrumbs()`;
3. Conecta com os recursos (`$resource`) ativando permissões.

## Exemplo Real de Uso

```php
namespace Modules\Fiscal\Pages;

use Livewire\Component;
use Modules\Framework\Concerns\IsPage;

class CreateNfePage extends Component
{
    use IsPage;

    protected static ?string $resource = NfeResource::class;
    protected static ?string $title = 'Emitir Nova NF-e';

    public function mount()
    {
        // ...
    }
}
```

## Funcionalidades Dinâmicas

### `dispatchModal(string $modalId, array $data = [])`
Diferente das emissões puras, este helper formata um evento modal de painel e pré-carrega qualquer array repassado estado via Livewire.

### `exception($e, $stopPropagation)` global
Se o usuário tentar editar um registro que outro colega de trabalho acabou de deletar, o `IsPage` intercepta a `RecordNotFoundException`, impedindo um erro fatal e emitindo um aviso amigável.
