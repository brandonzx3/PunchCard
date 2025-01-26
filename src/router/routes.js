
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: "/leagacy_import", component: () => import("pages/LegacyImport.vue"), },
      {
        path: "/admin",
        component: () => import ("layouts/AdminLayout.vue"),
        children: [
          { path: '', component: () => import("pages/AdminPage.vue") }
        ]
      }
    ]
  },

  {
    path: '/sus',
    component: () => import('pages/sus.vue')
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
