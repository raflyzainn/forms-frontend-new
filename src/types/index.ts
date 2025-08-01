export interface Form {
  id: string
  title: string
  description?: string
  comment?: string
  opened_date?: string
  deadline?: string
  is_active?: boolean
  deadline_message?: string
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
  
  export interface CustomURL {
    id: string
    form_id: string
    form_token: string
    custom_slug: string
    redirect_type: 'user' | 'admin'
    is_active: boolean
    created_time: string
    updated_time: string
  }

  export interface CustomURLResponse {
    redirect_url: string
    form_token: string
    redirect_type: string
    form: Form
  }

  export interface FormWithCustomURLs extends Form {
  custom_urls?: CustomURL[]
  is_open?: boolean
  status?: string
  deadline_info?: {
    deadline: string
    days_remaining: number
    message: string
  }
}

export interface FormAccessResponse {
  form: Form
  is_open: boolean
  status: string
  access_type: string
  form_token: string
  custom_slug: string
  deadline_info?: {
    deadline: string
    days_remaining: number
    message: string
  }
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string[]
  borderColor: string[]
  borderWidth: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface TextAnalysis {
  total_text_responses: number
  unique_responses: number
  top_responses: Record<string, number>
  sample_responses: string[]
}

export interface QuestionStatistics {
  question_id: string
  question_title: string
  question_type: string
  total_responses: number
  chart_data: ChartData
  text_analysis?: TextAnalysis
}

export interface FormStatistics {
  form_id: string
  form_title: string
  total_responses: number
  questions: QuestionStatistics[]
}

export interface StatisticsResponse {
  success: boolean
  data: FormStatistics
}

export interface SingleQuestionStatisticsResponse {
  success: boolean
  data: QuestionStatistics
}
  
  