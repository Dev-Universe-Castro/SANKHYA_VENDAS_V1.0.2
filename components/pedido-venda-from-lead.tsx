"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, Search, Edit, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstoqueModal } from "@/components/estoque-modal"
import { ProdutoSelectorModal } from "@/components/produto-selector-modal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ItemPedido {
  CODPROD: string
  DESCRPROD?: string
  QTDNEG: number
  VLRUNIT: number
  PERCDESC: number
  CODLOCALORIG: string
  CONTROLE: string
  AD_QTDBARRA?: number
  CODVOL?: string
  IDALIQICMS?: string
  SEQUENCIA?: number // Adicionado para o ProdutoSelectorModal
}

interface PedidoVendaFromLeadProps {
  dadosIniciais: any
  onSuccess: () => void
  onCancel: () => void
  onSalvarPedido?: (salvarFn: () => Promise<boolean>) => void
}

export default function PedidoVendaFromLead({ dadosIniciais, onSuccess, onCancel, onSalvarPedido }: PedidoVendaFromLeadProps) {
  const [loading, setLoading] = useState(false)
  const [parceiros, setParceiros] = useState<any[]>([])
  const [showProdutoModal, setShowProdutoModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)
  const [parceiroSearch, setParceiroSearch] = useState("")
  const [showParceirosDropdown, setShowParceirosDropdown] = useState(false)
  const [showEstoqueModal, setShowEstoqueModal] = useState(false)
  const [produtoEstoqueSelecionado, setProdutoEstoqueSelecionado] = useState<any | null>(null)
  const [removendoItem, setRemovendoItem] = useState<number | null>(null)
  const [vendedores, setVendedores] = useState<any[]>([])
  const [showVendedorModal, setShowVendedorModal] = useState(false)
  const [tiposNegociacao, setTiposNegociacao] = useState<any[]>([])
  const [tiposOperacao, setTiposOperacao] = useState<any[]>([])
  const [condicaoComercialBloqueada, setCondicaoComercialBloqueada] = useState(false)
  const [condicaoComercialPorModelo, setCondicaoComercialPorModelo] = useState(false)
  const [tipoOperacaoBloqueado, setTipoOperacaoBloqueado] = useState(false)
  const [modeloNota, setModeloNota] = useState<string>("")

  // Passar a função salvarPedido para o componente pai quando disponível
  useEffect(() => {
    if (onSalvarPedido) {
      onSalvarPedido(salvarPedido)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [pedido, setPedido] = useState({
    CODEMP: dadosIniciais.CODEMP || "1",
    CODCENCUS: dadosIniciais.CODCENCUS || "0",
    NUNOTA: dadosIniciais.NUNOTA || "",
    DTNEG: new Date().toISOString().split('T')[0], // Sempre usar data de hoje
    DTFATUR: dadosIniciais.DTFATUR || "",
    DTENTSAI: dadosIniciais.DTENTSAI || "",
    CODPARC: dadosIniciais.CODPARC || "",
    CODTIPOPER: dadosIniciais.CODTIPOPER || "974",
    TIPMOV: dadosIniciais.TIPMOV || "P",
    CODTIPVENDA: dadosIniciais.CODTIPVENDA || "1",
    CODVEND: dadosIniciais.CODVEND || "0",
    OBSERVACAO: dadosIniciais.OBSERVACAO || "",
    VLOUTROS: dadosIniciais.VLOUTROS || 0,
    VLRDESCTOT: dadosIniciais.VLRDESCTOT || 0,
    VLRFRETE: dadosIniciais.VLRFRETE || 0,
    TIPFRETE: dadosIniciais.TIPFRETE || "S",
    ORDEMCARGA: dadosIniciais.ORDEMCARGA || "",
    CODPARCTRANSP: dadosIniciais.CODPARCTRANSP || "0",
    CODNAT: dadosIniciais.CODNAT || "0",
    TIPO_CLIENTE: dadosIniciais.TIPO_CLIENTE || "PJ",
    CPF_CNPJ: dadosIniciais.CPF_CNPJ || "",
    IE_RG: dadosIniciais.IE_RG || "",
    RAZAO_SOCIAL: dadosIniciais.RAZAOSOCIAL || "",
    itens: [] as ItemPedido[] // Inicializar itens como um array vazio
  })

  const [itens, setItens] = useState<ItemPedido[]>([])

  useEffect(() => {
    console.log('🔄 Efeito inicial - carregando dados do lead:', dadosIniciais)

    // Atualizar estado do pedido com dados iniciais (se existirem)
    setPedido(prev => ({
      ...prev,
      CODPARC: dadosIniciais.CODPARC || "",
      CPF_CNPJ: dadosIniciais.CPF_CNPJ || "",
      IE_RG: dadosIniciais.IE_RG || "",
      RAZAO_SOCIAL: dadosIniciais.RAZAOSOCIAL || dadosIniciais.RAZAO_SOCIAL || "",
      TIPO_CLIENTE: dadosIniciais.TIPO_CLIENTE || "PJ"
    }))

    // Mapear itens do lead para o formato correto
    if (dadosIniciais.itens && dadosIniciais.itens.length > 0) {
      const itensMapeados = dadosIniciais.itens.map((item: any, index: number) => ({
        CODPROD: String(item.CODPROD),
        DESCRPROD: item.DESCRPROD || '',
        QTDNEG: Number(item.QTDNEG) || 1,
        VLRUNIT: Number(item.VLRUNIT) || 0,
        PERCDESC: Number(item.PERCDESC) || 0,
        CODLOCALORIG: item.CODLOCALORIG || "700",
        CONTROLE: item.CONTROLE || "007",
        AD_QTDBARRA: item.AD_QTDBARRA || 1,
        CODVOL: item.CODVOL || "UN",
        IDALIQICMS: item.IDALIQICMS || "0",
        SEQUENCIA: item.SEQUENCIA || index + 1
      }))
      setItens(itensMapeados)
      setPedido(prev => ({ ...prev, itens: itensMapeados }))
      console.log('✅ Itens mapeados:', itensMapeados.length)
    }

    // Se tem parceiro vinculado, usar como sugestão inicial
    const codParcLead = dadosIniciais.CODPARC
    console.log('🔍 Verificando parceiro do lead:', codParcLead)

    if (codParcLead && String(codParcLead).trim() !== "" && String(codParcLead).trim() !== "0") {
      console.log('✅ Lead tem parceiro sugerido, preenchendo dados...')
      carregarDadosParceiro(String(codParcLead))
    } else {
      console.log('ℹ️ Lead sem parceiro vinculado - usuário deverá selecionar')
      // Limpar campo de busca se não tem parceiro
      setParceiroSearch("")
    }
  }, [dadosIniciais])

  const [itemAtual, setItemAtual] = useState<ItemPedido>({
    CODPROD: "",
    QTDNEG: 1,
    VLRUNIT: 0,
    PERCDESC: 0,
    CODLOCALORIG: "700",
    CONTROLE: "007",
    AD_QTDBARRA: 1,
    CODVOL: "UN",
    IDALIQICMS: "0"
  })

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false) // Verificar se é administrador

  useEffect(() => {
    carregarDadosIniciais()
  }, [])

  const carregarDadosIniciais = async () => {
    setIsInitialLoading(true)
    try {
      // Carregar apenas vendedor do usuário inicialmente
      await carregarVendedorUsuario()

      // Carregar outros dados em background sem bloquear a UI
      Promise.all([
        carregarTiposNegociacao(),
        carregarTiposOperacao()
      ]).catch(error => {
        console.error('Erro ao carregar dados complementares:', error)
      })

      // Parceiros serão carregados sob demanda quando o usuário abrir o seletor
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      toast.error('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsInitialLoading(false)
    }
  }

  const carregarVendedorUsuario = async () => {
    try {
      const userStr = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1]

      if (userStr) {
        const user = JSON.parse(decodeURIComponent(userStr))

        // Verificar se é administrador
        const isAdmin = user.role === 'Administrador' || user.role === 'Admin'
        setIsAdminUser(isAdmin)

        if (user.codVendedor) {
          setPedido(prev => ({ ...prev, CODVEND: String(user.codVendedor) }))
          console.log('✅ Vendedor automático:', user.codVendedor, '| Admin:', isAdmin)
        } else if (!isAdmin) {
          console.warn('⚠️ Usuário sem vendedor vinculado')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vendedor do usuário:', error)
    }
  }

  const carregarParceiros = async () => {
    try {
      // Tentar buscar do cache primeiro
      const cachedParceiros = sessionStorage.getItem('cached_parceiros')
      if (cachedParceiros) {
        try {
          const data = JSON.parse(cachedParceiros)
          // Garantir que é um array
          setParceiros(Array.isArray(data) ? data : [])
          console.log('✅ Parceiros carregados do cache (PedidoFromLead)')
          return
        } catch (e) {
          console.error('Erro ao parsear cache de parceiros:', e)
          sessionStorage.removeItem('cached_parceiros')
        }
      }

      const response = await fetch('/api/sankhya/parceiros?pageSize=100')
      const data = await response.json()
      const parceirosList = Array.isArray(data.parceiros) ? data.parceiros : []
      setParceiros(parceirosList)

      // Salvar no cache
      if (parceirosList.length > 0) {
        sessionStorage.setItem('cached_parceiros', JSON.stringify(parceirosList))
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
      setParceiros([]) // Sempre garantir array vazio em caso de erro
    }
  }

  const carregarVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores?tipo=vendedores')
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
        console.log('✅ Vendedores carregados:', data.length)
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    }
  }

  const carregarTiposNegociacao = async () => {
    try {
      const response = await fetch('/api/sankhya/tipos-negociacao')
      const data = await response.json()
      setTiposNegociacao(data.tiposNegociacao || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de negociação:', error)
    }
  }

  const carregarTiposOperacao = async () => {
    try {
      const response = await fetch('/api/sankhya/tipos-negociacao?tipo=operacao')
      const data = await response.json()
      setTiposOperacao(data.tiposOperacao || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de operação:', error)
    }
  }

  const [searchParceiroTimeout, setSearchParceiroTimeout] = useState<NodeJS.Timeout | null>(null)

  const buscarParceiros = async (search: string) => {
    // Só buscar se tiver 2+ caracteres
    if (search.length < 2) {
      setParceiros([])
      setShowParceirosDropdown(false)
      return
    }

    try {
      // Buscar do cache local
      const cachedParceiros = sessionStorage.getItem('cached_parceiros')
      if (cachedParceiros) {
        const parsedCache = JSON.parse(cachedParceiros)
        const allParceiros = parsedCache.parceiros || parsedCache
        const searchLower = search.toLowerCase()
        const filtered = allParceiros.filter((p: any) =>
          p.NOMEPARC?.toLowerCase().includes(searchLower) ||
          p.CGC_CPF?.includes(search) ||
          p.RAZAOSOCIAL?.toLowerCase().includes(searchLower) ||
          p.CODPARC?.toString().includes(search)
        )
        setParceiros(filtered)
        setShowParceirosDropdown(filtered.length > 0)
        console.log('✅ Parceiros filtrados (PedidoFromLead):', filtered.length)
        return
      }

      // Se não achou no cache, busca na API (endpoint otimizado com cache)
      const response = await fetch(`/api/sankhya/parceiros/search?q=${encodeURIComponent(search)}&limit=50`)
      const data = await response.json()

      console.log('📋 Parceiros encontrados:', data.parceiros?.length || 0)

      if (data.parceiros && data.parceiros.length > 0) {
        setParceiros(data.parceiros)
        setShowParceirosDropdown(true)
      } else {
        setParceiros([])
        setShowParceirosDropdown(false)
      }
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
      setParceiros([])
      setShowParceirosDropdown(false)
    }
  }

  const handleParceiroSearchDebounced = (search: string) => {
    setParceiroSearch(search)

    // Limpar timeout anterior
    if (searchParceiroTimeout) {
      clearTimeout(searchParceiroTimeout)
    }

    // Se campo vazio ou menos de 2 caracteres, limpar parceiros e fechar dropdown
    if (search.length < 2) {
      setParceiros([])
      setShowParceirosDropdown(false)
      return
    }

    // Aguardar 500ms após parar de digitar
    setSearchParceiroTimeout(setTimeout(() => {
      buscarParceiros(search)
    }, 500))
  }

  const carregarDadosParceiro = async (codParc: string) => {
    try {
      console.log('🔍 Carregando dados do parceiro vinculado ao lead:', codParc)

      // Buscar dados completos do parceiro
      const parceiroResponse = await fetch(`/api/sankhya/parceiros?searchCode=${codParc}&pageSize=1`)
      const parceiroData = await parceiroResponse.json()

      if (!parceiroData.parceiros || parceiroData.parceiros.length === 0) {
        console.error('❌ Parceiro não encontrado:', codParc)
        toast.error('Parceiro vinculado ao lead não foi encontrado')
        return
      }

      const parceiro = parceiroData.parceiros[0]
      console.log('✅ Parceiro do lead encontrado:', parceiro)

      // Validar dados essenciais
      if (!parceiro.CGC_CPF) {
        toast.error("Parceiro sem CPF/CNPJ cadastrado. Complete o cadastro antes de continuar.")
        return
      }

      if (!parceiro.IDENTINSCESTAD) {
        toast.error("Parceiro sem IE/RG cadastrado. Complete o cadastro antes de continuar.")
        return
      }

      // Preencher todos os dados do parceiro
      const nomeParc = parceiro.NOMEPARC || parceiro.RAZAOSOCIAL || ''
      const tipPessoa = parceiro.TIPPESSOA === 'J' ? 'PJ' : 'PF'

      setParceiroSearch(`${nomeParc} (✓ Código: ${codParc})`)

      setPedido(prev => ({
        ...prev,
        CODPARC: String(codParc),
        TIPO_CLIENTE: tipPessoa,
        CPF_CNPJ: parceiro.CGC_CPF,
        IE_RG: parceiro.IDENTINSCESTAD,
        RAZAO_SOCIAL: parceiro.RAZAOSOCIAL || nomeParc
      }))

      console.log('✅ Dados do parceiro preenchidos:', {
        CODPARC: codParc,
        CPF_CNPJ: parceiro.CGC_CPF,
        IE_RG: parceiro.IDENTINSCESTAD,
        RAZAO_SOCIAL: parceiro.RAZAOSOCIAL || nomeParc
      })

      // Verificar complemento (condição comercial)
      await verificarComplementoParceiro(String(codParc))

    } catch (error) {
      console.error('❌ Erro ao carregar dados do parceiro:', error)
      toast.error('Erro ao carregar dados do parceiro')
    }
  }

  const verificarComplementoParceiro = async (codParc: string) => {
    try {
      const response = await fetch(`/api/sankhya/parceiros/complemento?codParc=${codParc}`)
      const data = await response.json()

      if (data.sugTipNegSaid && data.sugTipNegSaid !== '0') {
        console.log('🔒 PRIORIDADE 1: Condição comercial do parceiro encontrada:', data.sugTipNegSaid)
        setPedido(prev => ({ ...prev, CODTIPVENDA: String(data.sugTipNegSaid) }))
        setCondicaoComercialBloqueada(true)
        setCondicaoComercialPorModelo(false)
        toast.info('Condição comercial definida pelo cadastro do parceiro')
      } else {
        console.log('ℹ️ Nenhuma condição comercial no parceiro - verificando modelo da nota')
        setCondicaoComercialBloqueada(false)
        if (modeloNota) {
          console.log('♻️ Reavaliando condição comercial do modelo após mudança de parceiro')
          await buscarDadosModeloNota(modeloNota)
        } else {
          setCondicaoComercialPorModelo(false)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar complemento do parceiro:', error)
      setCondicaoComercialBloqueada(false)
      if (modeloNota) {
        await buscarDadosModeloNota(modeloNota)
      }
    }
  }



  const buscarDadosModeloNota = async (nunota: string) => {
    if (!nunota || nunota.trim() === '') {
      // Se limpar o modelo, desbloquear tipo de operação e condição comercial
      setTipoOperacaoBloqueado(false)
      if (!condicaoComercialBloqueada) {
        setCondicaoComercialPorModelo(false)
      }
      return;
    }

    try {
      console.log('🔍 Buscando dados do modelo NUNOTA:', nunota)
      const response = await fetch(`/api/sankhya/tipos-negociacao?nunota=${nunota}`)
      const data = await response.json()

      if (data.codTipOper) {
        console.log('✅ Dados do modelo encontrados:', data)

        // SEMPRE atualizar tipo de operação e bloquear o campo
        setPedido(prev => ({
          ...prev,
          CODTIPOPER: String(data.codTipOper),
          // PRIORIDADE 1: Se tiver condição comercial do parceiro, NÃO atualiza
          ...(condicaoComercialBloqueada ? {} : { CODTIPVENDA: String(data.codTipVenda || prev.CODTIPVENDA) })
        }))

        // Bloquear tipo de operação quando vier do modelo
        setTipoOperacaoBloqueado(true)

        // PRIORIDADE 2: Só marca como "por modelo" se NÃO tiver do parceiro
        if (!condicaoComercialBloqueada && data.codTipVenda && data.codTipVenda !== '0') {
          setCondicaoComercialPorModelo(true)
          toast.success('Tipo de operação definido pelo modelo')
        } else if (condicaoComercialBloqueada) {
          toast.info('Tipo de operação definido pelo modelo. Condição comercial mantida do parceiro.')
        } else {
          toast.success('Tipo de operação definido pelo modelo')
          setCondicaoComercialPorModelo(false)
        }
      } else {
        console.log('ℹ️ Nenhum dado encontrado para este NUNOTA')
        toast.warning('Modelo da nota não encontrado')
        setTipoOperacaoBloqueado(false)
        setCondicaoComercialPorModelo(false)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do modelo da nota:', error)
      toast.error('Erro ao buscar dados do modelo')
      setTipoOperacaoBloqueado(false)
    }
  }

  const selecionarParceiro = async (parceiro: any) => {
    console.log('✅ Parceiro selecionado:', parceiro)

    const codParc = String(parceiro.CODPARC).trim()
    const nomeParc = parceiro.NOMEPARC || parceiro.RAZAOSOCIAL || ''

    // Validar dados essenciais antes de prosseguir
    if (!parceiro.CGC_CPF || !parceiro.CGC_CPF.trim()) {
      console.error('⚠️ Parceiro sem CPF/CNPJ:', parceiro)
      toast.error("Este parceiro não possui CPF/CNPJ cadastrado. Complete o cadastro antes de continuar.")
      return
    }

    if (!parceiro.IDENTINSCESTAD || !parceiro.IDENTINSCESTAD.trim()) {
      console.error('⚠️ Parceiro sem IE/RG:', parceiro)
      toast.error("Este parceiro não possui IE/RG cadastrado. Complete o cadastro antes de continuar.")
      return
    }

    // Fechar dropdown e limpar lista PRIMEIRO
    setShowParceirosDropdown(false)
    setParceiros([])

    // Preencher dados básicos do parceiro
    const tipPessoa = parceiro.TIPPESSOA === 'J' ? 'PJ' : 'PF'
    const dadosParceiro = {
      CODPARC: codParc,
      TIPO_CLIENTE: tipPessoa,
      CPF_CNPJ: parceiro.CGC_CPF,
      IE_RG: parceiro.IDENTINSCESTAD,
      RAZAO_SOCIAL: parceiro.RAZAOSOCIAL || nomeParc
    }

    // Atualizar estado do pedido
    setPedido(prev => ({
      ...prev,
      ...dadosParceiro
    }))

    // Atualizar campo de busca com nome do parceiro
    setParceiroSearch(`${nomeParc} (✓ Código: ${codParc})`)

    console.log('✅ Dados do parceiro salvos no estado:', dadosParceiro)

    toast.success(`Parceiro selecionado: ${nomeParc}`, {
      description: `Código: ${codParc}`
    })

    // Carregar complemento (condição comercial) em background
    await verificarComplementoParceiro(codParc)
  }

  const abrirModalNovoItem = () => {
    setItemAtual({
      CODPROD: "",
      QTDNEG: 1,
      VLRUNIT: 0,
      PERCDESC: 0,
      CODLOCALORIG: "700",
      CONTROLE: "007",
      AD_QTDBARRA: 1,
      CODVOL: "UN",
      IDALIQICMS: "0"
    })
    setCurrentItemIndex(null)
    // Abrir diretamente o modal de busca de produtos
    setShowProdutoModal(true)
  }

  const abrirModalEditarItem = (index: number) => {
    setItemAtual({ ...itens[index] })
    setCurrentItemIndex(index)
    // Abrir modal de busca para editar produto
    setShowProdutoModal(true)
  }

  const removerItem = async (index: number) => {
    setRemovendoItem(index)
    // Simulação de delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 300))
    setItens(itens.filter((_, i) => i !== index))
    setPedido(prev => ({ ...prev, itens: itens.filter((_, i) => i !== index) }))
    setRemovendoItem(null)
    toast.success("Item removido")
  }



  const selecionarProduto = async (produto: any) => {
    setShowProdutoModal(false)
    setProdutoEstoqueSelecionado(produto)
    setShowEstoqueModal(true)
  }

  const handleConfirmarProdutoEstoque = async (produto: any, preco: number) => {
    setShowEstoqueModal(false)
    setShowProdutoModal(false)

    const novoItem: ItemPedido = {
      CODPROD: produto.CODPROD,
      DESCRPROD: produto.DESCRPROD,
      QTDNEG: 1,
      VLRUNIT: preco,
      PERCDESC: 0,
      CODLOCALORIG: "700",
      CONTROLE: "007",
      AD_QTDBARRA: 1,
      CODVOL: "UN",
      IDALIQICMS: "0",
      SEQUENCIA: pedido.itens.length + 1 // Adiciona sequencia ao novo item
    }

    if (currentItemIndex !== null) {
      // Editando item existente - manter quantidade e desconto
      const itemExistente = itens[currentItemIndex]
      novoItem.QTDNEG = itemExistente.QTDNEG
      novoItem.PERCDESC = itemExistente.PERCDESC
      novoItem.CODLOCALORIG = itemExistente.CODLOCALORIG

      const novosItens = [...itens]
      novosItens[currentItemIndex] = novoItem
      setItens(novosItens)
      setPedido(prev => {
        const updatedItens = [...prev.itens]
        updatedItens[currentItemIndex] = novoItem
        return { ...prev, itens: updatedItens }
      })
      toast.success("Item atualizado")
    } else {
      // Adicionando novo item
      setItens([...itens, novoItem])
      setPedido(prev => ({ ...prev, itens: [...prev.itens, novoItem] }))
      toast.success("Item adicionado")
    }

    setCurrentItemIndex(null)
  }

  const abrirModalEstoque = (produto: any) => {
    setProdutoEstoqueSelecionado(produto)
    setShowEstoqueModal(true)
  }

  const calcularTotal = (item: ItemPedido) => {
    const total = item.QTDNEG * item.VLRUNIT
    const desconto = total * (item.PERCDESC / 100)
    return total - desconto
  }

  const calcularTotalPedido = () => {
    return itens.reduce((acc, item) => acc + calcularTotal(item), 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const onClose = () => {
    onCancel()
  }

  const salvarPedido = async (): Promise<boolean> => {
    console.log('🔍 Validando dados do pedido:', {
      CODPARC: pedido.CODPARC,
      CPF_CNPJ: pedido.CPF_CNPJ,
      IE_RG: pedido.IE_RG,
      RAZAO_SOCIAL: pedido.RAZAO_SOCIAL,
      MODELO_NOTA: modeloNota,
      parceiroSearch: parceiroSearch,
      dadosIniciaisCODPARC: dadosIniciais.CODPARC,
      estadoCompletoPedido: pedido
    })

    // Validar modelo da nota APENAS se informado e não vazio
    if (modeloNota && modeloNota.trim() !== '' && modeloNota.trim() !== '0') {
      const modeloNotaNum = parseInt(modeloNota)
      if (isNaN(modeloNotaNum) || modeloNotaNum <= 0) {
        console.error('❌ Validação falhou: Modelo da nota inválido -', modeloNota)
        toast.error("O modelo da nota deve ser um número válido")
        return false
      }
    }

    // Validar CODPARC com mensagem mais específica
    const codParcStr = String(pedido.CODPARC || '').trim()

    console.log('🔍 Validação de parceiro:', {
      'CODPARC original': pedido.CODPARC,
      'CODPARC trimmed': codParcStr,
      'CPF_CNPJ': pedido.CPF_CNPJ,
      'IE_RG': pedido.IE_RG,
      'RAZAO_SOCIAL': pedido.RAZAO_SOCIAL,
      'parceiroSearch': parceiroSearch
    })

    if (!codParcStr || codParcStr === '' || codParcStr === "0") {
      console.error('❌ Validação falhou: CODPARC inválido ou vazio')
      console.error('Estado completo do pedido:', pedido)
      toast.error("Parceiro não selecionado corretamente", {
        description: "Por favor, selecione um parceiro da lista de busca antes de salvar"
      })
      return false
    }

    console.log('✅ CODPARC válido:', codParcStr)

    // Validar CPF/CNPJ
    if (!pedido.CPF_CNPJ || pedido.CPF_CNPJ.trim() === '') {
      console.error('❌ Validação falhou: CPF/CNPJ vazio')
      toast.error("CPF/CNPJ do parceiro não encontrado", {
        description: "O parceiro selecionado não possui CPF/CNPJ. Complete o cadastro antes de continuar."
      })
      return false
    }

    // Validar IE/RG
    if (!pedido.IE_RG || pedido.IE_RG.trim() === '') {
      console.error('❌ Validação falhou: IE/RG vazio')
      toast.error("IE/RG do parceiro não encontrado", {
        description: "O parceiro selecionado não possui IE/RG. Complete o cadastro antes de continuar."
      })
      return false
    }

    // Validar Razão Social
    if (!pedido.RAZAO_SOCIAL || pedido.RAZAO_SOCIAL.trim() === '') {
      console.error('❌ Validação falhou: Razão Social vazia')
      toast.error("Razão Social do parceiro não encontrada", {
        description: "O parceiro selecionado não possui Razão Social. Complete o cadastro antes de continuar."
      })
      return false
    }

    if (!pedido.CODVEND || pedido.CODVEND === "0") {
      toast.error("É necessário vincular um vendedor. Entre em contato com o administrador.")
      return false
    }

    // Verifica se há itens tanto no estado quanto nos dados do lead
    const temItens = (itens && itens.length > 0) || (dadosIniciais.itens && dadosIniciais.itens.length > 0)

    if (!temItens) {
      console.log('❌ Validação de itens falhou:', { itens, dadosIniciais })
      toast.error("Adicione pelo menos um item ao pedido")
      return false
    }

    setLoading(true)

    try {
      console.log('📦 Criando pedido de venda...')
      // Garante que os itens sejam carregados corretamente
      const itensParaEnviar = itens && itens.length > 0 ? itens : dadosIniciais.itens || []

      console.log('📦 Itens a serem enviados:', itensParaEnviar)

      const pedidoData = {
        ...pedido,
        // Só enviar MODELO_NOTA se estiver preenchido e for diferente de vazio/zero
        ...(modeloNota && modeloNota.trim() !== '' && modeloNota.trim() !== '0' ? { MODELO_NOTA: modeloNota } : {}),
        itens: itensParaEnviar.map(item => ({
          CODPROD: item.CODPROD,
          QTDNEG: item.QTDNEG,
          VLRUNIT: item.VLRUNIT,
          PERCDESC: item.PERCDESC,
          CODLOCALORIG: item.CODLOCALORIG,
          CONTROLE: item.CONTROLE,
          AD_QTDBARRA: item.AD_QTDBARRA,
          CODVOL: item.CODVOL,
          IDALIQICMS: item.IDALIQICMS
        }))
      }

      // Criar pedido
      const responsePedido = await fetch('/api/sankhya/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      });

      if (!responsePedido.ok) {
        const error = await responsePedido.json();
        throw new Error(error.error || 'Erro ao criar pedido');
      }

      const resultadoPedido = await responsePedido.json();
      console.log('✅ Pedido criado:', resultadoPedido);

      // ====== SINCRONIZAR PRODUTOS E ATUALIZAR LEAD PARA GANHO VIA ORACLE ======
      console.log('🔄 Iniciando sincronização de produtos e atualização para GANHO...');
      console.log('📋 CODLEAD do lead:', dadosIniciais.CODLEAD);

      try {
        // Validar que temos o CODLEAD
        if (!dadosIniciais.CODLEAD) {
          throw new Error('CODLEAD não encontrado nos dados do lead');
        }

        // 1. PRIMEIRO: Sincronizar produtos do pedido com AD_ADLEADSPRODUTOS
        console.log('📦 Iniciando sincronização de produtos...');

        const responseProdutosAtuais = await fetch(`/api/leads/produtos?codLead=${dadosIniciais.CODLEAD}`);
        const produtosAtuais = responseProdutosAtuais.ok ? await responseProdutosAtuais.json() : [];

        const produtosAtuaisMap = new Map(
          produtosAtuais.map((p: any) => [Number(p.CODPROD), p])
        );

        const produtosPedidoMap = new Map(
          pedidoData.itens.map((p: any) => [Number(p.CODPROD), p])
        );

        console.log('📊 Status dos produtos:', {
          produtosAtuais: produtosAtuais.length,
          produtosPedido: pedidoData.itens.length
        });

        // Remover produtos que não estão mais no pedido
        for (const produtoAtual of produtosAtuais) {
          const codProd = Number(produtoAtual.CODPROD);
          if (!produtosPedidoMap.has(codProd)) {
            console.log(`➖ Removendo produto ${codProd} do lead`);
            await fetch('/api/leads/produtos/remover', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                codItem: produtoAtual.CODITEM,
                codLead: dadosIniciais.CODLEAD
              })
            });
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Adicionar ou atualizar produtos do pedido
        for (const itemPedido of pedidoData.itens) {
          const codProd = Number(itemPedido.CODPROD);
          const produtoAtual = produtosAtuaisMap.get(codProd);
          const vlrTotal = itemPedido.QTDNEG * itemPedido.VLRUNIT;

          if (produtoAtual) {
            // Verificar se precisa atualizar
            if (
              produtoAtual.QUANTIDADE !== itemPedido.QTDNEG ||
              produtoAtual.VLRUNIT !== itemPedido.VLRUNIT
            ) {
              console.log(`🔄 Atualizando produto ${codProd} - Qtd: ${itemPedido.QTDNEG}, Vlr Unit: ${itemPedido.VLRUNIT}, Vlr Total: ${vlrTotal}`);
              const respUpdate = await fetch('/api/leads/produtos/atualizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  codItem: produtoAtual.CODITEM,
                  codLead: dadosIniciais.CODLEAD,
                  quantidade: itemPedido.QTDNEG,
                  vlrunit: itemPedido.VLRUNIT
                })
              });

              if (!respUpdate.ok) {
                const errorData = await respUpdate.json();
                throw new Error(`Erro ao atualizar produto ${codProd}: ${errorData.error}`);
              }

              await new Promise(resolve => setTimeout(resolve, 200));
            } else {
              console.log(`✓ Produto ${codProd} já está correto`);
            }
          } else {
            console.log(`➕ Adicionando produto ${codProd} - Qtd: ${itemPedido.QTDNEG}, Vlr Unit: ${itemPedido.VLRUNIT}, Vlr Total: ${vlrTotal}`);
            const respAdd = await fetch('/api/leads/produtos/adicionar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                CODLEAD: dadosIniciais.CODLEAD,
                CODPROD: codProd,
                DESCRPROD: itemPedido.DESCRPROD || `Produto ${codProd}`,
                QUANTIDADE: itemPedido.QTDNEG,
                VLRUNIT: itemPedido.VLRUNIT,
                VLRTOTAL: vlrTotal
              })
            });

            if (!respAdd.ok) {
              const errorData = await respAdd.json();
              throw new Error(`Erro ao adicionar produto ${codProd}: ${errorData.error}`);
            }

            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        console.log('✅ Produtos sincronizados com sucesso');

        // Aguardar para garantir que o banco atualizou
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. DEPOIS: Atualizar status do lead para GANHO diretamente via Oracle
        console.log('🏆 Atualizando lead para status GANHO...');

        const responseStatus = await fetch('/api/leads/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codLead: String(dadosIniciais.CODLEAD),
            status: 'GANHO'
          })
        });

        const statusResult = await responseStatus.json();

        if (!responseStatus.ok) {
          console.error('❌ Erro ao atualizar status do lead:', statusResult);
          throw new Error(statusResult.error || 'Erro ao atualizar status do lead');
        }

        console.log('✅ Lead atualizado para GANHO no Oracle:', statusResult);

        // 3. Criar atividade de PEDIDO
        console.log('📝 Criando atividade de PEDIDO...');
        const valorTotalPedido = pedidoData.itens.reduce((sum: number, item: any) => sum + (item.QTDNEG * item.VLRUNIT), 0);

        await fetch('/api/leads/atividades/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            CODLEAD: dadosIniciais.CODLEAD,
            TIPO: 'PEDIDO',
            TITULO: `Pedido ${resultadoPedido.nunota} criado`,
            DESCRICAO: `Pedido de venda criado com sucesso.\nNúmero: ${resultadoPedido.nunota}\nValor: R$ ${valorTotalPedido.toFixed(2)}`,
            DATA_INICIO: new Date().toISOString(),
            DATA_FIM: new Date().toISOString(),
            DADOS_COMPLEMENTARES: JSON.stringify({
              nunota: resultadoPedido.nunota,
              valorTotal: valorTotalPedido
            }),
            COR: '#22C55E'
          })
        });

        console.log('✅ Lead, produtos e atividade sincronizados com sucesso');

        toast.success("Pedido criado com sucesso!", {
          description: `Lead marcado como GANHO. Pedido: ${resultadoPedido.nunota}`,
          duration: 3000
        });

        // Aguardar um momento para garantir que o banco foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Chamar onSuccess que vai atualizar o kanban e fechar os modais
        console.log('🔄 Chamando onSuccess para atualizar kanban...');
        await onSuccess?.();

        console.log('✅ onSuccess executado com sucesso');

      } catch (syncError: any) {
        console.error('❌ Erro ao sincronizar lead:', syncError);
        console.error('❌ Stack trace:', syncError.stack);
        toast.error('Erro ao atualizar lead', {
          description: syncError.message || 'O pedido foi criado mas houve erro ao atualizar o lead',
          duration: 5000
        });
        throw syncError;
      }

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error);
      toast.error(`Erro ao criar pedido: ${error.message || 'Erro desconhecido'}`, {
        duration: 8000,
        description: 'Verifique os dados e tente novamente. O lead não foi marcado como ganho.'
      })
      return false
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <Accordion type="multiple" defaultValue={["parceiro", "nota", "itens"]} className="space-y-3">
        {/* Dados do Parceiro */}
        <AccordionItem value="parceiro" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Dados do Parceiro</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2 md:col-span-2">
                <Label className="text-xs">
                  Parceiro *
                  {pedido.CODPARC && pedido.CODPARC !== "0" && (
                    <span className="ml-2 text-[10px] text-green-600 font-semibold">
                      (✓ Selecionado - Código: {pedido.CODPARC})
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    value={parceiroSearch}
                    onChange={(e) => {
                      const value = e.target.value
                      handleParceiroSearchDebounced(value)
                      // Se limpar o campo, limpar também o CODPARC
                      if (!value || value.trim() === '') {
                        setPedido(prev => ({
                          ...prev,
                          CODPARC: '',
                          CPF_CNPJ: '',
                          IE_RG: '',
                          RAZAO_SOCIAL: '',
                          TIPO_CLIENTE: 'PJ'
                        }))
                      }
                    }}
                    onFocus={() => {
                      if (parceiroSearch.length >= 2 && parceiros.length > 0) {
                        setShowParceirosDropdown(true)
                      }
                    }}
                    onBlur={() => {
                      // Aguardar um pouco antes de fechar para permitir o clique
                      setTimeout(() => setShowParceirosDropdown(false), 200)
                    }}
                    placeholder={pedido.CODPARC && pedido.CODPARC !== "0" ? "Parceiro selecionado - clique para alterar" : "Digite o nome do parceiro (min. 2 caracteres)..."}
                    className={`text-sm ${pedido.CODPARC && pedido.CODPARC !== "0" ? 'border-green-500 bg-green-50 font-medium' : ''}`}
                  />

                  {/* Dropdown de parceiros */}
                  {showParceirosDropdown && parceiros.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {parceiros.map((parceiro: any) => (
                        <div
                          key={parceiro.CODPARC}
                          onClick={() => selecionarParceiro(parceiro)}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{parceiro.NOMEPARC || parceiro.RAZAOSOCIAL}</div>
                          <div className="text-xs text-gray-500">
                            Código: {parceiro.CODPARC} | {parceiro.CGC_CPF}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo Cliente *</Label>
                <Select value={pedido.TIPO_CLIENTE} onValueChange={(value) => setPedido({ ...pedido, TIPO_CLIENTE: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">CPF/CNPJ *</Label>
                <Input
                  value={pedido.CPF_CNPJ}
                  onChange={(e) => setPedido({ ...pedido, CPF_CNPJ: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">IE/RG *</Label>
                <Input
                  value={pedido.IE_RG}
                  onChange={(e) => setPedido({ ...pedido, IE_RG: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Razão Social *</Label>
                <Input
                  value={pedido.RAZAO_SOCIAL}
                  onChange={(e) => setPedido({ ...pedido, RAZAO_SOCIAL: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dados da Nota */}
        <AccordionItem value="nota" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Dados da Nota</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Data Negociação *</Label>
                <Input
                  type="date"
                  value={pedido.DTNEG}
                  onChange={(e) => setPedido({ ...pedido, DTNEG: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">
                  Vendedor *
                  {!isAdminUser && pedido.CODVEND !== "0" && (
                    <span className="ml-2 text-[10px] text-orange-600 font-semibold">(🔒 Automático)</span>
                  )}
                  {isAdminUser && (
                    <span className="ml-2 text-[10px] text-green-600 font-semibold">(✅ Editável)</span>
                  )}
                </Label>
                <div className="flex gap-1">
                  <Input
                    value={pedido.CODVEND}
                    readOnly
                    placeholder={!isAdminUser ? "Vendedor vinculado ao usuário" : "Código do Vendedor"}
                    className={`text-xs md:text-sm h-8 md:h-10 ${!isAdminUser ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                  />
                  {isAdminUser && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        await carregarVendedores()
                        setShowVendedorModal(true)
                      }}
                      className="h-8 w-8 md:h-10 md:w-10"
                    >
                      <Search className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">
                  Tipo Operação *
                  {tipoOperacaoBloqueado && (
                    <span className="ml-2 text-[10px] text-blue-600 font-semibold">(🔒 Definido pelo Modelo)</span>
                  )}
                </Label>
                <Select
                  value={pedido.CODTIPOPER}
                  onValueChange={(value) => {
                    if (!tipoOperacaoBloqueado) {
                      setPedido({ ...pedido, CODTIPOPER: value })
                    }
                  }}
                  disabled={tipoOperacaoBloqueado}
                >
                  <SelectTrigger className={`text-xs md:text-sm h-8 md:h-10 ${tipoOperacaoBloqueado ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Selecione o tipo de operação" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposOperacao.map((tipo) => (
                      <SelectItem key={tipo.CODTIPOPER} value={String(tipo.CODTIPOPER)}>
                        {tipo.DESCROPER}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">
                  Modelo da Nota (opcional)
                  <span className="ml-2 text-[10px] text-gray-500">(deixe vazio para usar padrão)</span>
                </Label>
                <Input
                  type="number"
                  value={modeloNota}
                  onChange={(e) => setModeloNota(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value.trim() !== '' && e.target.value.trim() !== '0') {
                      buscarDadosModeloNota(e.target.value)
                    }
                  }}
                  placeholder="Digite NUNOTA para copiar ou deixe vazio"
                  className="text-xs md:text-sm h-8 md:h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo de Movimento</Label>
                <Select value={pedido.TIPMOV} onValueChange={(value) => setPedido({ ...pedido, TIPMOV: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">Pedido</SelectItem>
                    <SelectItem value="V">Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">
                  Condição Comercial *
                  {condicaoComercialBloqueada && pedido.CODTIPVENDA !== '0' && (
                    <span className="ml-2 text-[10px] text-orange-600 font-semibold">(🔒 Prioridade 1: Parceiro)</span>
                  )}
                  {!condicaoComercialBloqueada && condicaoComercialPorModelo && pedido.CODTIPVENDA !== '0' && (
                    <span className="ml-2 text-[10px] text-blue-600">(📋 Prioridade 2: Modelo)</span>
                  )}
                  {(!condicaoComercialBloqueada && !condicaoComercialPorModelo) || pedido.CODTIPVENDA === '0' ? (
                    <span className="ml-2 text-[10px] text-green-600">(✅ Seleção manual)</span>
                  ) : null}
                </Label>
                <Select
                  value={String(pedido.CODTIPVENDA)}
                  onValueChange={(value) => {
                    // Permitir alteração manual se:
                    // 1. Não estiver bloqueado pelo parceiro (OU valor for 0)
                    // 2. Não estiver bloqueado pelo modelo (OU valor for 0)
                    const podeAlterar = pedido.CODTIPVENDA === '0' || (!condicaoComercialBloqueada && !condicaoComercialPorModelo)
                    if (podeAlterar) {
                      setPedido({ ...pedido, CODTIPVENDA: value })
                    }
                  }}
                  disabled={pedido.CODTIPVENDA !== '0' && (condicaoComercialBloqueada || condicaoComercialPorModelo)}
                >
                  <SelectTrigger className={`text-xs md:text-sm h-8 md:h-10 ${(pedido.CODTIPVENDA !== '0' && (condicaoComercialBloqueada || condicaoComercialPorModelo)) ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Selecione a condição comercial" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposNegociacao.map((tipo) => (
                      <SelectItem key={tipo.CODTIPVENDA} value={String(tipo.CODTIPVENDA)}>
                        {tipo.DESCRTIPVENDA}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2 md:col-span-2">
                <Label className="text-xs">Observação</Label>
                <Textarea
                  value={pedido.OBSERVACAO}
                  onChange={(e) => setPedido({ ...pedido, OBSERVACAO: e.target.value })}
                  className="text-xs md:text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Valores */}
        <AccordionItem value="valores" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Valores</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Valor Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLRFRETE}
                  onChange={(e) => setPedido({ ...pedido, VLRFRETE: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo Frete</Label>
                <Select value={pedido.TIPFRETE} onValueChange={(value) => setPedido({ ...pedido, TIPFRETE: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Sem Frete</SelectItem>
                    <SelectItem value="C">CIF</SelectItem>
                    <SelectItem value="F">FOB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Outros Valores (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLOUTROS}
                  onChange={(e) => setPedido({ ...pedido, VLOUTROS: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Desconto (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.PERCDESC}
                  onChange={(e) => setPedido({ ...pedido, PERCDESC: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Desconto Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLRDESCTOT}
                  onChange={(e) => setPedido({ ...pedido, VLRDESCTOT: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Itens do Pedido */}
        <AccordionItem value="itens" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-green-600 rounded"></div>
                <span className="text-sm md:text-base font-semibold text-green-800">
                  Itens do Pedido
                  {itens.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                      {itens.length}
                    </span>
                  )}
                </span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  abrirModalNovoItem()
                }}
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 md:px-4 pb-3 md:pb-4 pt-3">
            {itens.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">#</TableHead>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">Produto</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4">Qtd</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4 hidden sm:table-cell">Vlr. Unit.</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4">Total</TableHead>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-[10px] md:text-xs px-1 md:px-4">{item.SEQUENCIA}</TableCell>
                        <TableCell className="text-[10px] md:text-xs px-1 md:px-4">
                          <div className="font-medium">{item.DESCRPROD}</div>
                          <div className="text-[8px] md:text-[10px] text-muted-foreground">Cód: {item.CODPROD}</div>
                        </TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4">{item.QTDNEG}</TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4 hidden sm:table-cell">{formatCurrency(item.VLRUNIT)}</TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4 font-medium text-green-700">
                          {formatCurrency(calcularTotal(item))}
                        </TableCell>
                        <TableCell className="px-1 md:px-4">
                          <div className="flex gap-0.5 md:gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirModalEditarItem(index)}
                              className="h-6 w-6 md:h-7 md:w-7"
                              disabled={removendoItem === index}
                            >
                              <Edit className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerItem(index)}
                              className="h-6 w-6 md:h-7 md:w-7 text-red-600"
                              disabled={removendoItem === index}
                            >
                              {removendoItem === index ? (
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Total do Pedido */}
      <Card className="border-green-200">
        <CardContent className="pt-3 md:pt-4 p-3 md:p-4">
          <div className="flex justify-between items-center p-2 md:p-3 bg-green-50 rounded-lg">
            <span className="font-bold text-xs md:text-sm">Total do Pedido:</span>
            <span className="text-base md:text-lg font-bold text-green-700">{formatCurrency(calcularTotalPedido())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Busca de Produto */}
      <ProdutoSelectorModal
        isOpen={showProdutoModal}
        onClose={() => setShowProdutoModal(false)}
        onConfirm={(produto: any, preco: number, quantidade: number) => {
          const novoItem: ItemPedido = {
            CODPROD: String(produto.CODPROD),
            DESCRPROD: produto.DESCRPROD,
            QTDNEG: quantidade,
            VLRUNIT: preco,
            PERCDESC: 0,
            CODLOCALORIG: "700",
            CONTROLE: "007",
            AD_QTDBARRA: 1,
            CODVOL: "UN",
            IDALIQICMS: "0",
            SEQUENCIA: pedido.itens.length + 1
          }
          setItens([...itens, novoItem])
          setShowProdutoModal(false)
          toast.success("Produto adicionado!")
        }}
        titulo="Buscar Produto"
      />

      {/* Modal de Estoque */}
      <EstoqueModal
        isOpen={showEstoqueModal}
        onClose={() => {
          setShowEstoqueModal(false)
          setShowProdutoModal(true)
        }}
        product={produtoEstoqueSelecionado}
        onConfirm={handleConfirmarProdutoEstoque} // Passar a nova função de confirmação
      />

      {/* Modal de Seleção de Vendedor */}
      <Dialog open={showVendedorModal} onOpenChange={setShowVendedorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Selecionar Vendedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {vendedores.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum vendedor encontrado
                </div>
              ) : (
                vendedores.map((vendedor) => (
                  <Card
                    key={vendedor.CODVEND}
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => {
                      setPedido({ ...pedido, CODVEND: String(vendedor.CODVEND) })
                      setShowVendedorModal(false)
                      toast.success(`Vendedor ${vendedor.APELIDO} selecionado`)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{vendedor.APELIDO}</p>
                          <p className="text-xs text-muted-foreground">Cód: {vendedor.CODVEND}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}