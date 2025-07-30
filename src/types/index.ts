export interface Form {
  id: string
  title: string
  description?: string
  comment?: string
  created_time: string
  updated_time?: string
}

export interface FormSectionOrder {
  id: string
  form_id: string
  section_id: string
  order_sequence: string
  created_time: string
  created_by: string | null
  updated_time: string
  updated_by: string | null
  section: {
    id: string
    category_id: string
    section: string
    title: string | null
    description: string | null
    created_time: string
    created_by: string
    updated_time: string
    updated_by: string
    order_sequence: string | null
  }
}

export interface FormSectionsResponse {
  success: boolean
  data: FormSectionOrder[]
}
  
  export type QuestionSection = {
    id: string;
    form_id: string;
    title: string;
    description?: string;
    questions?: any[] 
  };
  
  export interface Question {
  questionId: string
  form_id: string
  title: string
  description?: string
  mandatory: boolean
  comment?: string
  order_sequence?: number
  type?: {
    type: string
    name: string
  }
  category?: {
    category: string
    title?: string
  }
  section?: {
    id: string
    title: string
    description?: string
  }
  choices?: Array<{
    choiceId: string
    title: string
  }>
}

export interface Choice {
  id: string
  choice_id: string
  question_id: string
  title?: string
  description?: string
  comment?: string
  order_sequence: number
}

  export interface Category {
    id: string
    category: string
    title: string
    description: string
  }

  export interface Section {
    id: string
    category_id: string
    section: string
    title: string
    description: string
    order_sequence?: number
  }

  export type QuestionCategory = {
    id: string;
    category: string;
    title: string;
    description: string;
  }

  export interface QuestionType {
    id: string
    type: string
    name: string
  }

  export interface Submission {
    id: string
    nik: string
    form_id: string
    sequence: string
    submitted_date: string
    created_time: string
  }

  export interface Answer {
    id: string
    nik: string
    is_document: boolean
    is_multiple_choice: boolean
    is_custom_choice: boolean
    question_id: string
    value: string | null
    comment: string | null
    sequence: string
    submitted_date: string
    created_time: string
    created_by: string
    updated_time: string
    updated_by: string | null
    question: {
      id: string
      form_id: string
      type_id: string
      category_id: string
      section_id: string
      title: string
      description: string | null
      comment: string | null
      is_mandatory: string
      order_sequence: string
      created_time: string
      created_by: string | null
      updated_time: string
      updated_by: string | null
    }
    choices: any[]
    documents: any[]
  }
  
  