

export default class SidebarMenu {

    private per_fix = "/app";

    setSingleMenu = (title: string, icon: string, link: string, can?: string) => {
        return {
            "title": title,
            "type": 'single',
            "icon": icon,
            "link": this.per_fix + link,
            "can": can,
        }
    }
    setMultiMenu = (title: string, icon: string, can?: string, sub_menu?: any) => {
        return {
            "title": title,
            "icon": icon,
            "can": can,
            "type": "multi",
            "sub_menu": sub_menu, // Initialize an empty array for sub-menu
        }
    }
    setSubMenu = (title: string, link: string, can?: string) => {
        return {
            "title": title,
            "link": this.per_fix + link,
            "can": can,
        }
    }
    setHeadingMenu = (title: string) => {
        return {
            "title": title,
            "type": "heading",
        }
    }
    getMenuList(): any[] {
        return [
            this.setHeadingMenu('Analytics'),
            this.setMultiMenu('Dashboards', 'bx bx-home', 'dashboard-view',
                [
                    this.setSubMenu('Dashboard', '/dashboard', 'bx bx-home'),
                ],
            ),
            this.setHeadingMenu('Management & Apps'),
            this.setHeadingMenu('Tools & Sessions'),
            this.setMultiMenu('Settings', 'bx bx-cog', 'Settings',
                [
                    this.setSubMenu('Account ', '/settings/user-account', 'bx bx-cog'),
                    this.setSubMenu('Users', '/settings/users', 'bx bx-group'),
                    this.setSubMenu('Roles', '/settings/roles', 'bx bx-user-check'),
                ]
            ),
        ];
    }

}