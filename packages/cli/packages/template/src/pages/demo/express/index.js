import React from "@react";
class Express extends React.Component {
    constructor() {
        super();
        this.state = {
            title: "使用 React 编写小程序",
            pages: [
                {
                    title: 'API',
                    url: '/pages/demo/api/index'
                },
                {
                    title: '继承',
                    url: '/pages/demo/extend/index'
                },
                {
                    title: "无状态组件",
                    url: "/pages/demo/stateless/index"
                },
                {
                    title: "循环",
                    url: "/pages/demo/loop/index"
                },
                {
                    title: "三重循环",
                    url: "/pages/demo/loop3/index"
                },
                {
                    title: '行内样式',
                    url: "/pages/demo/inlineStyle/index"
                }
            ]
        };
    }
    config = {
        "navigationBarTextStyle": "#fff",
        "navigationBarBackgroundColor": "#0088a4",
        "navigationBarTitleText": "Demo",
        "backgroundColor": "#eeeeee",
        "backgroundTextStyle": "light"
    }
    render() {
        return (
            <div class='container'>
                <div class='page_hd'>{this.state.title}</div>
                <div class='page_bd'>
                    <div class='navigation'>
                        {
                            this.state.pages.map(function(page) {
                                return <navigator open-type="navigate" class='item' hover-class="navigator-hover" url={page.url}>{page.title}</navigator>
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}
export default Express;
