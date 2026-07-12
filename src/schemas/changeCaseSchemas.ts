import { z } from 'zod'

export const physicalAddressTypes = ['01', '02'] as const

export type AddressChangeForm = z.infer<typeof addressChangeSchema>
export type ChangeCaseQueryForm = z.infer<typeof changeCaseQuerySchema>
export type MainAmountChangeForm = z.infer<typeof mainAmountChangeSchema>
export type RiderAmountChangeForm = z.infer<typeof riderAmountChangeSchema>

export function isPhysicalAddressType(addressType: string) {
  return physicalAddressTypes.includes(addressType as (typeof physicalAddressTypes)[number])
}

const requiredText = (fieldName: string) => z.string().trim().min(1, `${fieldName}不可空白`)

// 新增、查詢、覆核頁共用的保單查詢條件檢核。
export const changeCaseQuerySchema = z.object({
  policyNo: requiredText('保單號碼'),
  policySeq: z.number({ error: '序號不可空白' }).int('序號需為整數').positive('序號需大於 0')
})

// 001 地址變更檢核：01/02 走實體地址；其他地址型態走 email / 電話 / 手機。
export const addressChangeSchema = z
  .object({
    addressType: requiredText('地址型態'),
    zipCode3: z.string(),
    zipCode2: z.string(),
    fullWidthAddress: z.string(),
    halfWidthAddress: z.string()
  })
  .superRefine((value, context) => {
    // 非實體地址不檢核郵遞區號與地址，避免 email / 電話 / 手機被地址規則誤擋。
    if (!isPhysicalAddressType(value.addressType)) {
      if (!value.halfWidthAddress.trim()) {
        context.addIssue({
          code: 'custom',
          path: ['halfWidthAddress'],
          message: 'email / 電話 / 手機不可空白'
        })
      }
      return
    }

    if (!/^\d{3}$/.test(value.zipCode3)) {
      context.addIssue({
        code: 'custom',
        path: ['zipCode3'],
        message: '郵遞區號前三碼必填，且需為 3 碼'
      })
    }
    if (value.zipCode2 && !/^\d{3}$/.test(value.zipCode2)) {
      context.addIssue({
        code: 'custom',
        path: ['zipCode2'],
        message: '郵遞區號後三碼可空白；若填寫需為 3 碼'
      })
    }
    if (!value.fullWidthAddress.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['fullWidthAddress'],
        message: '地址不可空白'
      })
    }
  })

// 002 主約保額變更檢核。
export const mainAmountChangeSchema = z.object({
  masterInsuredAmount: z.number({ error: '主約保額不可空白' }).nonnegative('主約保額不可小於 0')
})

// 003 附約保額變更檢核；rideOrder 是後端更新正確附約列的 key。
export const riderAmountChangeSchema = z.object({
  rides: z
    .array(
      z.object({
        rideOrder: requiredText('附約序號'),
        insuredAmount: z.number({ error: '附約保額不可空白' }).nonnegative('附約保額不可小於 0')
      })
    )
    .min(1, '至少需有一筆附約資料')
})

// UI 目前只顯示第一個錯誤，避免一次拋出多個訊息造成使用者難判斷。
export function firstSchemaMessage(result: z.ZodSafeParseResult<unknown>) {
  return result.success ? '' : (result.error.issues[0]?.message ?? '欄位檢核失敗')
}
