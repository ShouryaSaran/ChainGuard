import React, { useState } from 'react'
import ShipmentCard from './ShipmentCard'
import { Search, Plus, X } from 'lucide-react'
import { shipmentAPI } from '../../services/api'

const AddShipmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tracking_id: '',
    origin: '',
    destination: '',
    cargo_type: 'Electronics',
    status: 'in_transit',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await shipmentAPI.createShipment(formData)
      setFormData({
        tracking_id: '',
        origin: '',
        destination: '',
        cargo_type: 'Electronics',
        status: 'in_transit',
      })
      onClose()
      onSuccess?.()
    } catch (err) {
      console.error('Failed to create shipment:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg p-6 w-96 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-text">New Shipment</h2>
          <button
            onClick={onClose}
            className="text-dark-muted hover:text-dark-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5">Tracking ID</label>
            <input
              type="text"
              name="tracking_id"
              value={formData.tracking_id}
              onChange={handleChange}
              placeholder="e.g., CP-123456"
              required
              className="w-full bg-dark-bg border border-gray-700/50 rounded px-3 py-2 text-dark-text text-sm focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1.5">Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g., Shanghai"
                required
                className="w-full bg-dark-bg border border-gray-700/50 rounded px-3 py-2 text-dark-text text-sm focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1.5">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g., Rotterdam"
                required
                className="w-full bg-dark-bg border border-gray-700/50 rounded px-3 py-2 text-dark-text text-sm focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5">Cargo Type</label>
            <select
              name="cargo_type"
              value={formData.cargo_type}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-gray-700/50 rounded px-3 py-2 text-dark-text text-sm focus:outline-none focus:border-accent-blue"
            >
              <option>Electronics</option>
              <option>Textiles</option>
              <option>Chemicals</option>
              <option>Food</option>
              <option>Machinery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-dark-bg border border-gray-700/50 rounded px-3 py-2 text-dark-text text-sm focus:outline-none focus:border-accent-blue"
            >
              <option value="in_transit">In Transit</option>
              <option value="delayed">Delayed</option>
              <option value="at_risk">At Risk</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700/50 text-dark-text hover:bg-gray-700/20 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-accent-blue text-dark-text hover:bg-blue-600 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ShipmentList = ({ shipments, loading, onSelectShipment, selectedShipment }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredShipments = shipments.filter(s =>
    s.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddSuccess = () => {
    // Trigger refresh if needed
  }

  return (
    <div className="flex flex-col h-full bg-dark-card rounded-lg animate-fade-in">
      {/* Header with Title and Count */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-text">Active Shipments</h2>
          <span className="px-2.5 py-1 rounded-full bg-blue-900/30 text-accent-blue text-xs font-semibold">
            {shipments.length}
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-dark-bg rounded px-3 py-2">
          <Search size={16} className="text-dark-muted" />
          <input
            type="text"
            placeholder="Search by ID, origin, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-dark-text text-sm outline-none w-full placeholder-dark-muted"
          />
        </div>
      </div>

      {/* Shipment List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-dark-muted py-8">Loading shipments...</div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center text-dark-muted py-8">No shipments found</div>
        ) : (
          filteredShipments.map((shipment, index) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              index={index}
              onSelect={() => onSelectShipment(shipment)}
              isSelected={selectedShipment?.id === shipment.id}
            />
          ))
        )}
      </div>

      {/* Add Shipment Button */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-accent-blue text-dark-text py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Shipment</span>
        </button>
      </div>

      {/* Add Shipment Modal */}
      <AddShipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}

export default ShipmentList
