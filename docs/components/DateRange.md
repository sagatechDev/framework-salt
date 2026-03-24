# DateRange Component

O componente `DateRange` abstrai a necessidade de dois inputs (`start` e `end`). Ele agrupa as datas de forma unificada e salva os valores diretamente nas variáveis correspondentes.

## Exemplo

```php
use Modules\Framework\Components\DateRange;

DateRange::create('Período de Faturamento', 'start_date', 'end_date')
```

## Benefícios
Ele resolve a tradução de objetos do tipo `Carbon` que vêm do banco transformando automagicamente no formato aceito pelo navegador (`'Y-m-d'`).
