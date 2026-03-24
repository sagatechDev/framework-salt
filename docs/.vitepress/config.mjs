import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Framework Salt",
  description: "Documentação do framework interno ERP",
  base: '/framework-salt/',
  ignoreDeadLinks: true,
  themeConfig: {
    outline: {
      label: 'Nesta página'
    },
    docFooter: {
      prev: 'Página Anterior',
      next: 'Próxima Página'
    },
    darkModeSwitchLabel: 'Tema Escuro',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Voltar ao topo',
    notFound: {
      title: 'Página não Encontrada',
      quote: 'Acho que você navegou longe demais e acabou se perdendo no framework...',
      linkLabel: 'Voltar ao início',
      linkText: 'Me leve para casa',
      code: '404'
    },
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Utilitários', link: '/utils' }
    ],

    sidebar: [
      {
        text: 'Arquitetura e Essenciais',
        items: [
          { text: 'Introdução', link: '/' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'Resource e Pages', link: '/resource' },
          { text: 'Menu Lateral (Sidebar)', link: '/sidebar' },
          { text: 'Utilitários Gerais', link: '/utils' }
        ]
      },
      {
        text: 'Formulários e Componentes',
        items: [
          { text: 'Campos de Entrada (Inputs)', link: '/form-fields' },
          { text: 'Componentes Estruturais', link: '/form-structure' },
          { text: 'Repeater e Variações', link: '/repeater' },
          { text: 'Estado e Livewire', link: '/component-state' },
          { text: 'Visibilidade e Desabilitação', link: '/component-behavior' }
        ]
      },
      {
        text: 'Ciclo de Vida Livewire (Concerns)',
        items: [
          { text: 'Submissão de Formulário', link: '/livewire-submit' },
          { text: 'Upload de Arquivos', link: '/livewire-uploads' },
          { text: 'Modais e Registros', link: '/livewire-modal-record' },
          { text: 'Outros Concerns Livewire', link: '/livewire-others' }
        ]
      },
      {
        text: 'Tabelas',
        items: [
          { text: 'Filtros do DataTable', link: '/datatable-filters' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SagatechDev' }
    ],

    cleanUrls: true
  }
})
