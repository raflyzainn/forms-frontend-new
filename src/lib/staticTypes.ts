import { QuestionTypeName } from '@/types/enum'
import { QuestionType } from '@/types/index'

export const STATIC_QUESTION_TYPES: QuestionType[] = [
  {
    id: '858c0a3f-638d-11f0-81b4-cc1531536fd7',
    type: '1',
    name: QuestionTypeName.YesNo,
  },
  {
    id: '858c134a-638d-11f0-81b4-cc1531536fd7',
    type: '2',
    name: QuestionTypeName.Text,
  },
  {
    id: '858c13d8-638d-11f0-81b4-cc1531536fd7',
    type: '3',
    name: QuestionTypeName.SingleItemChoice,
  },
  {
    id: '858c1405-638d-11f0-81b4-cc1531536fd7',
    type: '4',
    name: QuestionTypeName.SingleItemWithText,
  },
  {
    id: '858c142d-638d-11f0-81b4-cc1531536fd7',
    type: '5',
    name: QuestionTypeName.MultipleChoice,
  },
  {
    id: '858c1450-638d-11f0-81b4-cc1531536fd7',
    type: '6',
    name: QuestionTypeName.MultipleChoiceWithText,
  },
  {
    id: '858c1472-638d-11f0-81b4-cc1531536fd7',
    type: '7',
    name: QuestionTypeName.DocumentUpload,
  },
]

export const SECTION_COLORS = [
  {
    from: 'from-blue-600',
    to: 'to-indigo-600',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  {
    from: 'from-emerald-600',
    to: 'to-teal-600',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200'
  },
  {
    from: 'from-purple-600',
    to: 'to-violet-600',
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  {
    from: 'from-orange-600',
    to: 'to-amber-600',
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  {
    from: 'from-pink-600',
    to: 'to-rose-600',
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    border: 'border-pink-200'
  },
  {
    from: 'from-cyan-600',
    to: 'to-blue-600',
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-200'
  },
  {
    from: 'from-lime-600',
    to: 'to-green-600',
    bg: 'bg-lime-100',
    text: 'text-lime-600',
    border: 'border-lime-200'
  },
  {
    from: 'from-red-600',
    to: 'to-pink-600',
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  {
    from: 'from-yellow-600',
    to: 'to-orange-500',
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  {
    from: 'from-teal-600',
    to: 'to-cyan-600',
    bg: 'bg-teal-100',
    text: 'text-teal-600',
    border: 'border-teal-200'
  },
  {
    from: 'from-indigo-600',
    to: 'to-purple-600',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200'
  },
  {
    from: 'from-amber-600',
    to: 'to-yellow-500',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200'
  },
  {
    from: 'from-sky-600',
    to: 'to-blue-500',
    bg: 'bg-sky-100',
    text: 'text-sky-600',
    border: 'border-sky-200'
  },
  {
    from: 'from-fuchsia-600',
    to: 'to-pink-500',
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-600',
    border: 'border-fuchsia-200'
  }
]

// Helper function to get color for section index
export function getSectionColor(index: number) {
  return SECTION_COLORS[index % SECTION_COLORS.length]
}

// Template questions untuk form koperasi
export const TEMPLATE_QUESTIONS = [
  // 1. Text Question - Nama Koperasi
  {
    form_id: '', // Will be filled dynamically
    type_id: '858c134a-638d-11f0-81b4-cc1531536fd7', // Text
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Nama Koperasi',
    description: 'Masukkan nama lengkap koperasi sesuai akta',
    comment: 'Wajib diisi',
    is_mandatory: true,
    order_sequence: 1,
    choices: [] // No choices for text
  },
  
  // 2. Text Question - Alamat Koperasi
  {
    form_id: '',
    type_id: '858c134a-638d-11f0-81b4-cc1531536fd7', // Text
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Alamat Koperasi',
    description: 'Masukkan alamat lengkap koperasi',
    comment: 'Wajib diisi',
    is_mandatory: true,
    order_sequence: 2,
    choices: []
  },
  
  // 3. Text Question - Nomor Telepon
  {
    form_id: '',
    type_id: '858c134a-638d-11f0-81b4-cc1531536fd7', // Text
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Nomor Telepon',
    description: 'Masukkan nomor telepon yang dapat dihubungi',
    comment: 'Wajib diisi',
    is_mandatory: true,
    order_sequence: 3,
    choices: []
  },
  
  // 4. Text Question - Email
  {
    form_id: '',
    type_id: '858c134a-638d-11f0-81b4-cc1531536fd7', // Text
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Email',
    description: 'Masukkan alamat email koperasi',
    comment: 'Wajib diisi',
    is_mandatory: true,
    order_sequence: 4,
    choices: []
  },
  
  // 5. Single Choice Question - Jenis Koperasi
  {
    form_id: '',
    type_id: '858c13d8-638d-11f0-81b4-cc1531536fd7', // Single Choice
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Jenis Koperasi',
    description: 'Pilih jenis koperasi yang sesuai',
    comment: 'Pilih salah satu',
    is_mandatory: true,
    order_sequence: 5,
    choices: [
      '859E2003-638D-11F0-81B4-CC1531536FD7', // SNI
      '859E1F26-638D-11F0-81B4-CC1531536FD7', // BPOM
      '859E2045-638D-11F0-81B4-CC1531536FD7', // HACCP
      '859E1EC8-638D-11F0-81B4-CC1531536FD7', // Halal
      '859E1CE3-638D-11F0-81B4-CC1531536FD7'  // P-IRT
    ]
  },
  
  // 6. Multiple Choice Question - Sumber Modal
  {
    form_id: '',
    type_id: '858c1450-638d-11f0-81b4-cc1531536fd7', // Multiple Choice
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Sumber Modal',
    description: 'Pilih sumber modal yang digunakan (bisa lebih dari satu)',
    comment: 'Pilih semua yang sesuai',
    is_mandatory: true,
    order_sequence: 6,
    choices: [
      '859E2003-638D-11F0-81B4-CC1531536FD7', // Modal Kerja
      '859E1F26-638D-11F0-81B4-CC1531536FD7', // Pengembangan Usaha
      '859E2045-638D-11F0-81B4-CC1531536FD7', // Bank Mandiri
      '859E1EC8-638D-11F0-81B4-CC1531536FD7', // Bank BRI
      '859E1CE3-638D-11F0-81B4-CC1531536FD7', // Bank BNI
      '859E1FBC-638D-11F0-81B4-CC1531536FD7'  // Others
    ]
  },
  
  // 7. Document Upload Question
  {
    form_id: '',
    type_id: '858c1472-638d-11f0-81b4-cc1531536fd7', // Document Upload
    category_id: '857BC61C-638D-11F0-81B4-CC1531536FD7',
    section_id: '8589D000-638D-11F0-81B4-CC1531536FD7',
    title: 'Dokumen Pendukung',
    description: 'Upload dokumen pendukung koperasi (SK, NPWP, dll)',
    comment: 'Format PDF/JPG/PNG, maks 5MB',
    is_mandatory: true,
    order_sequence: 7,
    choices: []
  }
]