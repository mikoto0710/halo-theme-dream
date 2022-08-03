var Utils = {
    /**
     * 是否移动设备
     */
    isMobile() {
        if (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        )
            return true;
        return false;
    },
    /**
     * 有缓存的方式加载js
     */
    cachedScript(url, callback) {
        return $.ajax(jQuery.extend({
            url: url,
            type: 'get',
            dataType: 'script',
            cache: true,
            success: callback
        }, $.isPlainObject(url) && url));
    },
    /**
     * 时间格式化
     * @param {*} time
     */
    formatDate(date, fmt = "yyyy-MM-dd") {
        date = new Date(date);
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (date.getFullYear() + "").substr(4 - RegExp.$1.length)
            );
        }
        let o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
        };
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + "";
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? str : str.padStart(2, "0")
                );
            }
        }
        return fmt;
    },
    /* 获取URL中带的链接参数
   * @param search 链接后缀
   * @return {{}} 对象
   */
    getUrlParams() {
        var search = location.search;

        // 判断是否为字符串类型
        if (typeof search !== "string") {
            search = search.toString();
        }

        var paramsSplit = search.replace(/^[^\?]*\?/i, "").split(/&/);
        var params = {};

        // 数据为空
        if (paramsSplit.length < 1) {
            return params;
        }

        if (Array.isArray(paramsSplit)) {
            paramsSplit.forEach(function (item) {
                // 数据为空, 退出方法
                if (!item) {
                    return false;
                }
                var itemSplit = item.split(/=/);

                // 判断字符串中是否有多个=
                if (itemSplit.length >= 2) {
                    // 是
                    var key = itemSplit.splice(0, 1);
                    params[key] = itemSplit.join("=");
                }
            });
        }
        return params;
    },
    /* 随机颜色 */
    randomColor(factor) {
        const colors = ["#F8D800", "#0396FF", "#EA5455", "#7367F0", "#32CCBC", "#F6416C", "#28C76F", "#9F44D3", "#F55555", "#736EFE", "#E96D71", "#DE4313", "#D939CD", "#4C83FF", "#F072B6", "#C346C2", "#5961F9", "#FD6585", "#465EFB", "#FFC600", "#FA742B", "#5151E5", "#BB4E75", "#FF52E5", "#49C628", "#00EAFF", "#F067B4", "#F067B4", "#ff9a9e", "#00f2fe", "#4facfe", "#f093fb", "#6fa3ef", "#bc99c4", "#46c47c", "#f9bb3c", "#e8583d", "#f68e5f"];
        return colors[factor % colors.length]
    },
    /* 请求封装 */
    request({
                url = "",
                method = "GET",
                data,
                headers = {},
                timeout = 10000,
                returnRaw = false,
            }) {
        return new Promise((resolve, reject) => {
            method = method.toUpperCase();
            $.ajax({
                url,
                type: method,
                headers: {
                    "API-Authorization": DreamConfig.access_key || "dream",
                    ...headers,
                },
                async: true,
                dataType: "json",
                timeout,
                data,
                success(res) {
                    if (returnRaw) {
                        resolve(res);
                    } else {
                        if (res.status === 200) {
                            resolve(res.data || "");
                        } else {
                            reject(res);
                        }
                    }
                },
                error(err) {
                    const errMsg = err
                        ? err.responseJSON
                            ? err.responseJSON.message
                            : "请求失败"
                        : "请求失败";
                    Qmsg.error(errMsg);
                    reject(errMsg);
                },
            });
        });
    },

    /**
     * 点赞
     * @param likeButton 被点击的点赞按钮
     * @param likeNum 要显示点赞次数的元素
     * @param type 点赞类型，支持文章和日志
     */
    like(likeButton, likeNum, type) {
        const id = likeButton.attr("data-id");
        const name = encryption("agree-" + type);
        let agrees = localStorage.getItem(name);
        agrees = agrees ? JSON.parse(decrypt(agrees)) : [];
        // 已经喜欢过了
        if (agrees.includes(id)) {
            likeButton.removeClass("like");
            return;
        }
        likeButton.on("click", function (e) {
            e.stopPropagation();
            Utils.request({
                url: "/api/content/" + type + "/" + id + "/likes",
                method: "POST",
            })
                .then((_res) => {
                    let agrees = localStorage.getItem(name);
                    agrees = agrees ? JSON.parse(decrypt(agrees)) : [];
                    let likes = +(likeButton.attr("data-likes") || 0) + 1;
                    agrees.push(id);
                    likeButton.removeClass("like");
                    const val = encryption(JSON.stringify(agrees));
                    localStorage.setItem(name, val);
                    likeButton.off('click');
                    likeNum.html(likes);
                    Qmsg.success('点赞成功');
                });
        });
    },
    /* 百度自动推送 */
    baiduPush() {
        let bp = document.createElement('script');
        let curProtocol = window.location.protocol.split(':')[0];
        if (curProtocol === 'https') {
            bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
        }
        else {
            bp.src = 'http://push.zhanzhang.baidu.com/push.js';
        }
        $(`script[src="${bp.src}"]`).remove()
        let s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(bp, s);
    },
    toutiaoPush() {
        let el = document.createElement("script");
        el.src = "https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?0fbcfbb1ed642c21419d5be02d56ade7d6ee5372ca221d12ba35df110760b2a830632485602430134f60bc55ca391050b680e2741bf7233a8f1da9902314a3fa";
        el.id = "ttzz";
        $(`script[src="${el.src}"]`).remove()
        let s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(el, s);
    },
    /* sleep */
    sleep(ms = 250) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },
    /* 折叠代码块或者日志块 */
    foldBlock($container) {
        if (!DreamConfig.journals_fold_height) {
            return;
        }
        const oldHeight = $container.height();
        if ($container.is(".fold")) {
            $container.removeClass('fold').addClass('unfold');
        } else {
            const oldScrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
            $container.addClass('fold').removeClass('unfold');
            // 跳转位置，保证折叠后没有过大的位置偏移
            $("body,html").scrollTop(oldScrollTop - oldHeight + $container.height());
        }
    },
    /**
     * 删除元素的 class，可根据前缀来删除
     * @param {*} el 需要删除的 dom 元素
     * @param {*} prefix 需要删除的 class，可以仅为前缀
     */
    removeClassByPrefix(el, prefix) {
        const classes = el.className.split(" ").filter(function (c) {
            return c.lastIndexOf(prefix, 0) !== 0;
        });

        el.className = classes.join(" ").trim();
    },
};

window.Utils = Utils;
