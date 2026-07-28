import { describe, expect, it } from 'vitest'
import { navigationGroups, router } from './index'

describe('router navigation metadata', () => {
  it('每個選單頁面由 Router 集中提供群組、排序及功能代碼', () => {
    const menuRoutes = router.getRoutes().filter((route) => route.meta.menuGroup)
    expect(menuRoutes).toHaveLength(13)
    for (const route of menuRoutes) {
      expect(navigationGroups.some((group) => group.key === route.meta.menuGroup)).toBe(true)
      expect(route.meta.menuOrder).toBeTypeOf('number')
      expect(route.meta.functionCode).toMatch(/^M(?:PS|PM|CM|US)\d{5}$/)
      expect(route.components?.default).toBeTypeOf('function')
    }
  })

  it('三種保單查詢與異動服務各自使用獨立路由及功能代碼', () => {
    const maintenanceRoutes = [
      router.resolve('/policy/maintenance/master'),
      router.resolve('/policy/maintenance/address'),
      router.resolve('/policy/maintenance/rides')
    ]
    expect(maintenanceRoutes.map((route) => route.name)).toEqual([
      'policy-master-maintenance',
      'policy-address-maintenance',
      'policy-ride-maintenance'
    ])
    expect(maintenanceRoutes.map((route) => route.meta.functionCode)).toEqual(['MPM00004', 'MPM00005', 'MPM00006'])
    maintenanceRoutes.forEach((route) => expect(route.meta.roles).toEqual(['MAKER', 'ADMIN']))
  })

  it('未知網址由 404 路由承接', () => {
    expect(router.resolve('/not-an-existing-page').name).toBe('not-found')
  })
})
