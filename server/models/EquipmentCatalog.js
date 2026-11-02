import mongoose from 'mongoose';

const EquipmentCatalogSchema = new mongoose.Schema({
  category: { type: String, required: true }, // "SUTURE", "IMPLANT", "SPONGE", "TEMPLATE"
  code_name: { type: String, required: true, unique: true },
  display_label: { type: String, required: true },
  description: { type: String },
  standard_counts_per_pack: { type: Number, default: 1 },
  manufacturer_codes: [String],
  tags: [String]
}, { timestamps: true, collection: "ot_equipment_and_suture_catalog" });

export default mongoose.models.EquipmentCatalog || mongoose.model('EquipmentCatalog', EquipmentCatalogSchema);
