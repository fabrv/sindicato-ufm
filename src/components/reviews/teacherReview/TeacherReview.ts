import { Component } from "../../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'
import { SelectInterface } from "../../../components/select.interface";

export interface QuestionInterface {
  index: number
  question: string
  val: string
  caption: string
}

export interface TeacherReviewInterface {
  universities: Array<SelectInterface>
  questions: Array<QuestionInterface>
}

const template = fs.readFileSync(path.resolve(__dirname, 'teacherReview.html'), 'utf8')

/**
 * Class that represents an TeacherReview component
 */
export class TeacherReviewComponent extends Component<TeacherReviewInterface> {
  constructor(viewData: TeacherReviewInterface) {
    super(viewData, template)
  }
}