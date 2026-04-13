import { createSchemaField } from '@formily/react'
import {
  FormItem,
  Input,
  NumberPicker,
  Switch,
  Select,
  ArrayItems,
} from '@formily/antd-v5'
import { ImageUploader } from './ImageUploader'
import PagePicker from './PagePicker'
import { NavIconPicker } from './NavIconPicker'

export const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    NumberPicker,
    Switch,
    Select,
    'Input.TextArea': Input.TextArea,
    ArrayItems,
    'ArrayItems.Item': ArrayItems.Item,
    'ArrayItems.Addition': ArrayItems.Addition,
    'ArrayItems.Remove': ArrayItems.Remove,
    'ArrayItems.MoveUp': ArrayItems.MoveUp,
    'ArrayItems.MoveDown': ArrayItems.MoveDown,
    ImageUploader,
    PagePicker,
    NavIconPicker,
  },
})
