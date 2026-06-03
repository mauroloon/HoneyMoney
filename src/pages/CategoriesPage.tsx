import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'
import { CATEGORY_ICONS, PRESET_COLORS } from '../utils/icons'
import { TransactionType, Category } from '../types'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const { incomeCategories, expenseCategories, addCategory, updateCategory, deleteCategory } = useFinance()

  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categories = activeType === 'expense' ? expenseCategories : incomeCategories

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Back header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Categorías</h1>
        </div>

        {/* Type toggle */}
        <div className="px-4 pb-3">
          <div className="flex bg-gray-200 rounded-2xl p-1">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={activeType === t
                  ? { backgroundColor: t === 'income' ? '#34C759' : '#FF3B30', color: 'white' }
                  : { color: '#8E8E93' }}
              >
                {t === 'income' ? '↓ Ingresos' : '↑ Gastos'}
              </button>
            ))}
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="font-medium text-gray-700">Sin categorías</p>
              <p className="text-sm text-gray-400 mt-1">Crea tu primera categoría</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
              {categories.map((cat, i) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: cat.color_hex + '22' }}
                    >
                      {cat.icon}
                    </div>
                    <p className="flex-1 text-sm font-medium text-gray-900">{cat.name}</p>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mr-1"
                      style={{ backgroundColor: cat.color_hex }}
                    />
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cat.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {i < categories.length - 1 && <div className="h-px bg-gray-100 ml-16" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-fab flex items-center justify-center z-10"
      >
        <Plus size={24} />
      </button>

      {/* Create modal */}
      {showCreate && (
        <CategoryFormModal
          defaultType={activeType}
          onClose={() => setShowCreate(false)}
          onSave={async (data) => { await addCategory(data); setShowCreate(false) }}
        />
      )}

      {/* Edit modal */}
      {editingCategory && (
        <CategoryFormModal
          category={editingCategory}
          defaultType={editingCategory.type}
          onClose={() => setEditingCategory(null)}
          onSave={async (data) => { await updateCategory(editingCategory.id, data); setEditingCategory(null) }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <p className="font-semibold text-gray-900 text-center mb-1">¿Eliminar categoría?</p>
            <p className="text-sm text-gray-500 text-center mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">
                Cancelar
              </button>
              <button
                onClick={async () => { await deleteCategory(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface FormData {
  name: string
  icon: string
  color_hex: string
  type: TransactionType
}

function CategoryFormModal({ category, defaultType, onClose, onSave }: {
  category?: Category
  defaultType: TransactionType
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
}) {
  const isEditing = !!category
  const [name, setName]     = useState(category?.name ?? '')
  const [icon, setIcon]     = useState(category?.icon ?? CATEGORY_ICONS[0])
  const [color, setColor]   = useState(category?.color_hex ?? PRESET_COLORS[0])
  const [type, setType]     = useState<TransactionType>(category?.type ?? defaultType)
  const [saving, setSaving] = useState(false)

  const isValid = name.trim().length > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    await onSave({ name: name.trim(), icon, color_hex: color, type })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end justify-center">
      <div className="bg-bg-base rounded-t-3xl w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancelar</button>
          <span className="font-semibold text-gray-900">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</span>
          <button onClick={handleSave} disabled={!isValid || saving}
            className={`text-sm font-bold ${isValid ? 'text-primary' : 'text-gray-300'}`}>
            {saving ? '...' : 'Guardar'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Preview + name */}
          <div className="px-4 pt-4 pb-3">
            <div className="bg-white rounded-3xl p-4 shadow-card flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: color + '33' }}
              >
                {icon}
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre de la categoría"
                autoFocus
                className="flex-1 text-base font-semibold text-gray-900 placeholder-gray-300 bg-transparent"
              />
            </div>
          </div>

          {/* Type toggle — only when creating */}
          {!isEditing && (
            <div className="px-4 pb-3">
              <div className="flex bg-gray-200 rounded-2xl p-1">
                {(['expense', 'income'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={type === t
                      ? { backgroundColor: t === 'income' ? '#34C759' : '#FF3B30', color: 'white' }
                      : { color: '#8E8E93' }}
                  >
                    {t === 'income' ? '↓ Ingreso' : '↑ Gasto'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Icon picker */}
          <div className="px-4 pb-3">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-xs text-gray-400 mb-3">Ícono</p>
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_ICONS.map(ic => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className="w-full aspect-square rounded-2xl flex items-center justify-center text-xl transition-all"
                    style={icon === ic
                      ? { backgroundColor: color, boxShadow: `0 0 0 2px ${color}` }
                      : { backgroundColor: '#F2F2F7' }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color picker */}
          <div className="px-4 pb-8">
            <div className="bg-white rounded-3xl p-4 shadow-card">
              <p className="text-xs text-gray-400 mb-3">Color</p>
              <div className="grid grid-cols-6 gap-3">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-full aspect-square rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
