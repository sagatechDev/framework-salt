# Money Component

O componente `Money` é uma extensão de um input comum que gerencia entradas financeiras e moedas.

## Como Usar

```php
use Modules\Framework\Components\Money;

Money::create('Valor Unitário', 'vUnCom')
    ->prefix('R$');
```

Ele automaticamente aplica a máscara, atualiza dependências em backend com _wire:model_ e se liberta do uso manual rígido de views Blade.
