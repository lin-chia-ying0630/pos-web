import { describe, expect, it } from 'vitest'
import { flattenReviewContent, parseReviewContent } from './reviewDetail'

describe('reviewDetail', () => {
  it('parses legacy Java map-style code snapshots into individual fields', () => {
    expect(
      parseReviewContent(
        '{codeGroup=postal-code, codeField=zip_code3, codeBefore=983, codeAfter=花蓮縣|富里鄉, codeDescription=Fuli Township, Hualien County}'
      )
    ).toEqual({
      codeGroup: 'postal-code',
      codeField: 'zip_code3',
      codeBefore: '983',
      codeAfter: '花蓮縣|富里鄉',
      codeDescription: 'Fuli Township, Hualien County'
    })
  })

  it('flattens nested objects and arrays into one comparison field per value', () => {
    expect(
      flattenReviewContent({
        key: 'SCREEN|admin',
        functionCodes: ['MCM00001', 'MPM00001'],
        profile: { enabled: true }
      })
    ).toEqual({
      key: 'SCREEN|admin',
      'functionCodes[0]': 'MCM00001',
      'functionCodes[1]': 'MPM00001',
      'profile.enabled': true
    })
  })
})
