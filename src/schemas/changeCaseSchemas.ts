import { z } from 'zod'
import { POLICY_NO_MAX_LENGTH } from '../domain/domainConstraints'

export const physicalAddressTypes = ['01', '02'] as const

export type AddressChangeForm = z.infer<typeof addressChangeSchema>
export type ChangeCaseQueryForm = z.infer<typeof changeCaseQuerySchema>
export type MainAmountChangeForm = z.infer<typeof mainAmountChangeSchema>
export type RiderAmountChangeForm = z.infer<typeof riderAmountChangeSchema>

export function isPhysicalAddressType(addressTypeCode: string) {
  return physicalAddressTypes.includes(addressTypeCode as (typeof physicalAddressTypes)[number])
}

const requiredText = (fieldName: string) => z.string().trim().min(1, `${fieldName}不可空白`)

// 新增、查詢、覆核頁共用的保單查詢條件檢核。
export const changeCaseQuerySchema = z.object({
  policyNo: requiredText('保單號碼')
    .max(POLICY_NO_MAX_LENGTH, `保單號碼最多 ${POLICY_NO_MAX_LENGTH} 碼`)
    .regex(/^[A-Z0-9]+$/, '保單號碼只能包含大寫英文字母及數字'),
  policySeq: z.number({ error: '序號不可空白' }).int('序號需為整數').positive('序號需大於 0')
})

// 001 地址變更檢核：01/02 走實體地址；其他地址型態走 email / 電話 / 手機。
export const addressChangeSchema = z
  .object({
    addressTypeCode: requiredText('地址型態').max(8, '地址型態最多 8 碼'),
    postalCode: z.string(),
    addressText: z.string().max(300, '地址最多 300 個字元')
  })
  .superRefine((value, context) => {
    if (!/^\d{3}(?:\d{3})?$/.test(value.postalCode)) {
      context.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: '郵遞區號必須為 3 或 6 碼數字'
      })
    }
    if (!value.addressText.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['addressText'],
        message: '地址不可空白'
      })
    }
  })

// 002 主約保額變更檢核。
export const mainAmountChangeSchema = z.object({
  insuredAmount: z.number({ error: '主約保額不可空白' }).nonnegative('主約保額不可小於 0')
})

// 003 附約保額變更檢核；coverageItemSeq 是後端更新正確附約列的 key。
export const riderAmountChangeSchema = z.object({
  rides: z
    .array(
      z.object({
        coverageItemSeq: requiredText('附約序號')
          .max(10, '附約序號最多 10 碼')
          .regex(/^\d+$/, '附約序號只能包含數字')
          .refine((value) => value !== '000', '附約保額變更不可包含主約'),
        insuredAmount: z.number({ error: '附約保額不可空白' }).nonnegative('附約保額不可小於 0')
      })
    )
    .min(1, '至少需有一筆附約資料')
})

// UI 目前只顯示第一個錯誤，避免一次拋出多個訊息造成使用者難判斷。
export function firstSchemaMessage(result: z.ZodSafeParseResult<unknown>) {
  return result.success ? '' : (result.error.issues[0]?.message ?? '欄位檢核失敗')
}
