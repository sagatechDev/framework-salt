# Repeater Component

O `Repeater` interage direto na renderização do form clonando os filhos baseado em um índice de array numérico do formulário Livewire.

## Como Usar

```php
use Modules\Framework\Components\Repeater;
use ErpSaga\Livewire\Resources\Components\Forms\Input;

Repeater::create('historico', 'Histórico de Registros')
    ->content('Bloco')
    ->schema([
        Input::create('Detalhe', 'detalhe')
    ]);
```
