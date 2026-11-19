### 现在我需要对接，我的页面中的健康报告(wellness profile) 
我希望在进入我的页面后，如果是登录态，就直接先生产BeconToken,然后用于调取健康报告接口。
    - BeconApi-Staging: `https://global-stg.becon-api.com`
    - BeconApi-Production: `https://global-prd.becon-api.com`
现在有如下几个API,其中健康报告接口需要在header中加入 Authorization：Bearer dfi_token
#### 1、注册接口
    当我调用健康报告接口出现http的status为 400,401，并且返回体中的code字段为OAUTH_JOIN_REQUIRED时，需要重新获取dfi_token, 放置在注册接口的 body 中的dfi_token 字段中。 当返回 http status为200为成功。成功后使用刚刚的dfi_token,去继续调用健康报告接口,使用接口详情如下：

    - url：/account/join/dfi-b2c 
    - methods: Post
    - body: {dfi_token}
    - response :{"identifier": "zhaixie@dairy-farm.com.cn" }

#### 2、健康报告接口
    获取健康报告数据接口，http的status为400,401，并且返回体中的code字段为AUTH_FAILED时，需要重新获取dfi_token并重新尝试当前接口，以获取新的数据。当返回http status为200 就算成功。
    - url：/dfi/analysis-summary-b2c
    - methods: get
    - response 
        ```json
            {
                "user": {
                    "name": "xie xiaolong",
                    "email": "zhaixie@dairy-farm.com.cn",
                    "phoneNumber": "+65 18982774"
                },
                "summary": {
                    "COMPOSITE_SCALP": {
                        "type": "COMPOSITE_SCALP",
                        "analysisId": 5223, // 检测的ID
                        "compositeScore": 72, // 本次检测的分数
                        "myScoreLevel": "NORMAL", // 检测的标签
                        "previousScore": 72, //上次检测分数
                        "scoreDiff": 0, // 对比上次分值变化 
                        "accountType": "B2B",// B2B 表示in-store ,B2C 为in-app
                        "analysisDate": "2026-04-30T09:58:24.000Z" // 检测时间
                    },
                    "SKIN": {
                        "type": "SKIN",
                        "analysisId": 7856,
                        "compositeScore": 85.095,
                        "myScoreLevel": "HEALTHY",
                        "previousScore": 81.372,
                        "scoreDiff": 3.722999999999999,
                        "accountType": "B2B",
                        "analysisDate": "2025-12-18T03:29:07.000Z"
                    },
                    "HAIRLOSS_V3": {
                        "type": "HAIRLOSS_V3",
                        "analysisId": 3224,
                        "compositeScore": 82.39975906670603,
                        "myScoreLevel": "LEVEL2",
                        "previousScore": 80.05196273821878,
                        "scoreDiff": 2.3477963284872487,
                        "accountType": "B2B",
                        "analysisDate": "2025-12-04T00:43:02.000Z"
                    },
                }
            }
        ```


