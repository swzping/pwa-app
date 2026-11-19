#import "TikTokModule.h"
#import <TikTokBusinessSDK/TikTokBusinessSDK.h>

@implementation TikTokModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(trackEvent:(NSString *)eventName
                  properties:(NSDictionary *)properties)
{
    TikTokBaseEvent *event = [[TikTokBaseEvent alloc] initWithEventName:eventName];
    for (NSString *key in properties) {
        [event addPropertyWithKey:key value:properties[key]];
    }
    [TikTokBusiness trackTTEvent:event];
}

RCT_EXPORT_METHOD(trackPurchase:(nonnull NSNumber *)price
                  currency:(NSString *)currency
                  eventName:(NSString *)eventName
                  properties:(NSDictionary *)properties)
{
    TikTokBaseEvent *event = [[TikTokBaseEvent alloc] initWithEventName:eventName];
    [event addPropertyWithKey:@"value" value:[price stringValue]];
    [event addPropertyWithKey:@"currency" value:currency];
    for (NSString *key in properties) {
        [event addPropertyWithKey:key value:properties[key]];
    }
    [TikTokBusiness trackTTEvent:event];
}

@end
