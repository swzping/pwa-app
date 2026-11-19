import React, {Fragment} from 'react';
import {Text, View} from 'react-native';

import Svg, {Circle, G, Path} from 'react-native-svg';

import CustomView from '@app/components/CustomView';

const CIRCLE = 26;
const LINE = 3;
const LINE_GRAY = '#E0E0E0';
const LINE_ORANGE_LIGHT = 'rgba(245, 130, 32, 0.4)';
const LABEL_WIDTH = 120;
const REJECTED_PRIMARY = '#9E9E9E';

let PRIMARY = '#F58220';
let LABEL_COLOR = '#000000';

const StepClipboardCloseIcon = ({
  size = 20,
  bgColor = '#9E9E9E',
  strokeColor = bgColor,
  iconColor = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <Circle cx="13" cy="13" r="12.5" fill={bgColor} />
    <Circle cx="13" cy="13" r="12.5" stroke={strokeColor} />

    <G fill={iconColor}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 7C18.0938 7 19 7.90625 19 9V13.25C19 13.6642 18.6642 14 18.25 14C17.8358 14 17.5 13.6642 17.5 13.25V9C17.5 8.75 17.25 8.5 17 8.5H16.5V9.25C16.5 9.6875 16.1562 10 15.75 10H13H10.25C9.8125 10 9.5 9.6875 9.5 9.25V8.5H9C8.71875 8.5 8.5 8.75 8.5 9V19C8.5 19.2812 8.71875 19.5 9 19.5H12.25C12.6642 19.5 13 19.8358 13 20.25C13 20.6642 12.6642 21 12.25 21H9C7.875 21 7 20.125 7 19V9C7 7.90625 7.875 7 9 7H10.25H10.5312C10.7812 5.875 11.7812 5 13 5C14.1875 5 15.2188 5.875 15.4375 7H15.75H17ZM13 8.25C12.5625 8.25 12.25 7.9375 12.25 7.5C12.25 7.09375 12.5625 6.75 13 6.75C13.4062 6.75 13.75 7.09375 13.75 7.5C13.75 7.9375 13.4062 8.25 13 8.25Z"
      />
      <Path d="M14.2548 15.5048C14.5282 15.2315 14.9717 15.2315 15.2451 15.5048L19.2451 19.5048C19.5184 19.7782 19.5184 20.2217 19.2451 20.4951C18.9717 20.7684 18.5282 20.7684 18.2548 20.4951L14.2548 16.4951C13.9815 16.2217 13.9815 15.7782 14.2548 15.5048Z" />
      <Path d="M19.2452 15.5048C18.9718 15.2315 18.5283 15.2315 18.2549 15.5048L14.2549 19.5048C13.9816 19.7782 13.9816 20.2217 14.2549 20.4951C14.5283 20.7684 14.9718 20.7684 15.2452 20.4951L19.2452 16.4951C19.5185 16.2217 19.5185 15.7782 19.2452 15.5048Z" />
    </G>
  </Svg>
);

const StepClipboardIcon = ({
  size = 20,
  bgColor = '#FF8200',
  iconColor = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <Circle cx="13" cy="13" r="12.5" fill={bgColor} />
    <Circle cx="13" cy="13" r="12.5" stroke={bgColor} />

    <G fill={iconColor}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 7C18.0938 7 19 7.90625 19 9V13.25C19 13.6642 18.6642 14 18.25 14C17.8358 14 17.5 13.6642 17.5 13.25V9C17.5 8.75 17.25 8.5 17 8.5H16.5V9.25C16.5 9.6875 16.1562 10 15.75 10H13H10.25C9.8125 10 9.5 9.6875 9.5 9.25V8.5H9C8.71875 8.5 8.5 8.75 8.5 9V19C8.5 19.2812 8.71875 19.5 9 19.5H12.25C12.6642 19.5 13 19.8358 13 20.25C13 20.6642 12.6642 21 12.25 21H9C7.875 21 7 20.125 7 19V9C7 7.90625 7.875 7 9 7H10.25H10.5312C10.7812 5.875 11.7812 5 13 5C14.1875 5 15.2188 5.875 15.4375 7H15.75H17ZM13 8.25C12.5625 8.25 12.25 7.9375 12.25 7.5C12.25 7.09375 12.5625 6.75 13 6.75C13.4062 6.75 13.75 7.09375 13.75 7.5C13.75 7.9375 13.4062 8.25 13 8.25Z"
      />
    </G>

    <G stroke={iconColor} strokeLinecap="round" fill="none">
      <Path d="M16.5417 18.5417L18 20M17.1667 17.0833C17.1667 18.2339 16.2339 19.1667 15.0833 19.1667C13.9327 19.1667 13 18.2339 13 17.0833C13 15.9327 13.9327 15 15.0833 15C16.2339 15 17.1667 15.9327 17.1667 17.0833Z" />
    </G>
  </Svg>
);

const StepTruckIcon = ({
  size = 20,
  bgColor = '#FF8200',
  iconColor = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <Circle cx="13" cy="13" r="12.5" fill={bgColor} />
    <G fill={iconColor}>
      <Path d="M18.2752 19.5082C17.6162 19.5149 16.9772 19.2832 16.4769 18.8561C15.9765 18.429 15.6488 17.8356 15.5547 17.1861H13.2229C13.2229 17.9046 12.946 18.3481 12.4358 18.8561C11.9256 19.3642 11.2336 19.6496 10.5121 19.6496C9.79063 19.6496 9.09867 19.3642 8.58848 18.8561C8.0783 18.3481 7.78201 17.9046 7.78201 17.1861H6.22747C6.02132 17.1861 5.82362 17.1045 5.67785 16.9594C5.53209 16.8142 5.4502 16.6173 5.4502 16.4121V7.12364C5.4502 6.91836 5.53209 6.72148 5.67785 6.57632C5.82362 6.43116 6.02132 6.34961 6.22747 6.34961H15.5547C15.7609 6.34961 15.9586 6.43116 16.1044 6.57632C16.2501 6.72148 16.332 6.91836 16.332 7.12364V9.44575H19.4411C19.5434 9.44516 19.6448 9.46468 19.7395 9.5032C19.8342 9.54172 19.9203 9.59848 19.993 9.67022L21.4154 11.0867C21.7743 11.4494 22.0594 11.8778 22.2548 12.3484C22.4496 12.8171 22.55 13.3195 22.5502 13.8268V16.4121C22.5502 16.6173 22.4683 16.8142 22.3225 16.9594C22.1768 17.1045 21.9791 17.1861 21.7729 17.1861H20.9957C20.9015 17.8356 20.5739 18.429 20.0735 18.8561C19.5732 19.2832 18.9342 19.5149 18.2752 19.5082ZM18.2752 15.638C18.0446 15.638 17.8192 15.7061 17.6275 15.8337C17.4357 15.9613 17.2863 16.1426 17.198 16.3548C17.1098 16.5669 17.0867 16.8004 17.1317 17.0256C17.1767 17.2508 17.2877 17.4577 17.4508 17.6201C17.6138 17.7824 17.8216 17.893 18.0477 17.9378C18.2739 17.9826 18.5083 17.9596 18.7214 17.8717C18.9344 17.7839 19.1165 17.635 19.2446 17.4441C19.3727 17.2532 19.4411 17.0287 19.4411 16.7991C19.4411 16.4911 19.3183 16.1958 19.0996 15.9781C18.881 15.7603 18.5844 15.638 18.2752 15.638ZM10.5025 15.638C10.2719 15.638 10.0465 15.7061 9.85472 15.8337C9.66299 15.9613 9.51355 16.1426 9.42531 16.3548C9.33706 16.5669 9.31397 16.8004 9.35896 17.0256C9.40395 17.2508 9.51499 17.4577 9.67805 17.6201C9.8411 17.7824 10.0488 17.893 10.275 17.9378C10.5012 17.9826 10.7356 17.9596 10.9486 17.8717C11.1617 17.7839 11.3438 17.635 11.4719 17.4441C11.6 17.2532 11.6684 17.0287 11.6684 16.7991C11.6684 16.4911 11.5455 16.1958 11.3269 15.9781C11.1082 15.7603 10.8117 15.638 10.5025 15.638ZM20.7314 15.638H20.9957V13.8268C20.9951 13.2111 20.7491 12.6209 20.3117 12.1858L19.1224 10.9938H16.332V14.9027C16.6387 14.5914 17.0164 14.3584 17.4328 14.2236C17.8493 14.0888 18.2923 14.0561 18.7242 14.1283C19.1561 14.2005 19.5641 14.3754 19.9135 14.6383C20.263 14.9011 20.5435 15.2441 20.7314 15.638ZM12.9587 15.638H14.7775V7.89768H7.00474V15.638H8.04629C8.26732 15.1758 8.61536 14.7854 9.05007 14.5121C9.48478 14.2387 9.98836 14.0937 10.5025 14.0937C11.0166 14.0937 11.5202 14.2387 11.9549 14.5121C12.3896 14.7854 12.7376 15.1758 12.9587 15.638Z" />
    </G>
  </Svg>
);

const StepCompleteIcon = ({
  size = 20,
  bgColor = '#FF8200',
  iconColor = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <Circle cx="13" cy="13" r="13" fill={bgColor} />
    <G fill={iconColor}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 7C18.0938 7 19 7.90625 19 9V13.25C19 13.6642 18.6642 14 18.25 14C17.8358 14 17.5 13.6642 17.5 13.25V9C17.5 8.75 17.25 8.5 17 8.5H16.5V9.25C16.5 9.6875 16.1562 10 15.75 10H13H10.25C9.8125 10 9.5 9.6875 9.5 9.25V8.5H9C8.71875 8.5 8.5 8.75 8.5 9V19C8.5 19.2812 8.71875 19.5 9 19.5H12.25C12.6642 19.5 13 19.8358 13 20.25C13 20.6642 12.6642 21 12.25 21H9C7.875 21 7 20.125 7 19V9C7 7.90625 7.875 7 9 7H10.25H10.5312C10.7812 5.875 11.7812 5 13 5C14.1875 5 15.2188 5.875 15.4375 7H15.75H17ZM13 8.25C12.5625 8.25 12.25 7.9375 12.25 7.5C12.25 7.09375 12.5625 6.75 13 6.75C13.4062 6.75 13.75 7.09375 13.75 7.5C13.75 7.9375 13.4062 8.25 13 8.25Z"
      />
      <Path d="M15.9531 20.6172L19.2969 17.2734C19.5781 16.9922 19.5781 16.4922 19.2969 16.2109C18.9844 15.9297 18.5156 15.9297 18.2344 16.2109L15.4219 19.0234L14.2969 17.8672C13.9844 17.5859 13.5156 17.5859 13.2344 17.8672C12.9219 18.1797 12.9219 18.6484 13.2344 18.9297L14.8906 20.6172C15.1719 20.8984 15.6719 20.8984 15.9531 20.6172Z" />
    </G>
  </Svg>
);

const STEP_ICONS = [StepClipboardIcon, StepTruckIcon, StepCompleteIcon];
const REJECTED_STEP_ICONS = [
  StepClipboardCloseIcon,
  StepTruckIcon,
  StepCompleteIcon,
];

/**
 * ---------------------------------------------------- *
 * @constant {STATUS_STEP_CONFIG}
 * @summary display_status（7 态，即 Cancel & Return API §5
 *          枚举）→ 固定 3 步（Approval / Return / Refund）
 *          的展示配置，对齐设计稿 6 种样式：
 *          states: DONE（已完成，实心）/ CURRENT（进行中，
 *          实心）/ UPCOMING（未开始，描边 + 浅橙连线/文案）。
 *          设计稿未单独给出 APPROVED 样式，按进度规则组合：
 *          仅第 1 步实心、后续描边；REJECTED 整条灰显。
 * ---------------------------------------------------- *
 */
const STATUS_STEP_CONFIG = {
  PENDING_APPROVAL: {
    states: ['CURRENT', 'UPCOMING', 'UPCOMING'],
    labels: ['Pending Approval', 'Return', 'Refund'],
  },
  APPROVED: {
    states: ['DONE', 'UPCOMING', 'UPCOMING'],
    labels: ['Approved', 'Return', 'Refund'],
  },
  REJECTED: {
    states: ['DONE', 'UPCOMING', 'UPCOMING'],
    labels: ['Rejected', 'Return', 'Refund'],
    rejected: true,
  },
  IN_RETURN_TRANSIT: {
    states: ['DONE', 'CURRENT', 'UPCOMING'],
    labels: ['Approved', 'In Return', 'Refund'],
  },
  GOODS_RETURNED: {
    states: ['DONE', 'DONE', 'UPCOMING'],
    labels: ['Approved', 'Goods Returned', 'Refund'],
  },
  PROCESSING: {
    states: ['DONE', 'DONE', 'CURRENT'],
    labels: ['Approval', 'Goods Returned', 'Processing'],
  },
  REFUNDED: {
    states: ['DONE', 'DONE', 'DONE'],
    labels: ['Approval', 'Goods Returned', 'Refunded'],
  },
};

// 未知状态兜底：与 PENDING_APPROVAL 同构
const FALLBACK_STATUS_CONFIG = {
  states: ['CURRENT', 'UPCOMING', 'UPCOMING'],
  labels: ['Approval', 'Return', 'Refund'],
};

/**
 * ---------------------------------------------------- *
 * @function resolveStatusFromTimeline
 * @summary 未显式传 status 时，从 dfi_timeline 推导当前
 *          display status：优先取 state === 'CURRENT' 的
 *          节点 code，否则取最后一个 DONE 节点（如 REFUNDED
 *          全部 DONE 时取 REFUNDED）。
 * ---------------------------------------------------- *
 */
const resolveStatusFromTimeline = timelineParam => {
  const currentStep = timelineParam.find(step => step.state === 'CURRENT');
  if (currentStep?.code) {
    return currentStep.code;
  }
  const lastDoneIndex = timelineParam
    .map(step => step.state)
    .lastIndexOf('DONE');
  if (lastDoneIndex >= 0) {
    return timelineParam[lastDoneIndex].code;
  }
  return timelineParam[0]?.code || 'PENDING_APPROVAL';
};

const DEFAULT_STEPS = [
  {
    key: 'one',
    label: ['In Review', 'Approved', 'Approved'],
    icon: StepClipboardIcon,
  },
  {
    key: 'two',
    label: ['Delivery', 'In Delivery', 'Delivery'],
    icon: StepTruckIcon,
  },
  {
    key: 'three',
    label: ['Complete', 'Complete', 'Completed'],
    icon: StepCompleteIcon,
  },
];

const REJECTED_DEFAULT_STEPS = [
  {
    key: 'rejected_one',
    label: ['Rejected'],
    icon: StepClipboardCloseIcon,
  },
  {
    key: 'rejected_two',
    label: ['Delivery'],
    icon: StepTruckIcon,
  },
  {
    key: 'rejected_three',
    label: ['Complete'],
    icon: StepCompleteIcon,
  },
];

/**
 * ---------------------------------------------------- *
 * @components StepsIndicator
 * @summary horizontal stepper showing return/refund progress
 *          （固定 3 步：Approval / Return / Refund）
 *
 * @notes
 * - 推荐用法（Cancel & Return §9）：传 `timeline`
 *   （dfi_timeline）+ 可选 `status`（display_status 7 态之一）。
 *   组件按设计稿把后端 6/4/2 步的 timeline 收敛为固定 3 步
 *   展示，各状态的填充进度与文案见 STATUS_STEP_CONFIG；
 *   未传 status 时从 timeline 的 CURRENT / 最后一个 DONE
 *   节点推导。
 * - 步骤状态语义：DONE/CURRENT → 实心圆 + 黑色文案 + 实橙
 *   连线；UPCOMING → 描边圆 + 橙色文案 + 浅橙连线；
 *   REJECTED → 整条灰显（灰圆 + 灰文案 + 灰连线）。
 * - 旧用法（steps + current + approved）保留向后兼容
 * ---------------------------------------------------- *
 */
const StepsIndicator = ({
  steps,
  timeline,
  status,
  current = 0,
  approved = true,
  style,
}) => {
  // ---- 新用法：dfi_timeline + display status 驱动（固定 3 步） ----
  if (Array.isArray(timeline) && timeline.length > 0) {
    const activeStatus = status || resolveStatusFromTimeline(timeline);
    const config = STATUS_STEP_CONFIG[activeStatus] || FALLBACK_STATUS_CONFIG;
    const isRejectedStep = Boolean(config.rejected);
    const activePrimary = isRejectedStep ? REJECTED_PRIMARY : PRIMARY;
    const activeIcons = isRejectedStep ? REJECTED_STEP_ICONS : STEP_ICONS;

    return (
      <CustomView row style={[{paddingVertical: 16}, style]}>
        {config.states.map((stepState, index) => {
          const isUpcoming = stepState === 'UPCOMING';
          const isFilled = !isUpcoming;
          const IconComp = activeIcons[index] || StepClipboardIcon;
          const labelColor = isRejectedStep
            ? REJECTED_PRIMARY
            : isUpcoming
            ? activePrimary
            : LABEL_COLOR;

          return (
            <Fragment key={`${activeStatus}-${index}`}>
              {/* step: circle + label, fixed width so labels never squeeze the line */}
              <View style={{width: CIRCLE, alignItems: 'center'}}>
                <View
                  style={{
                    width: CIRCLE,
                    height: CIRCLE,
                    borderRadius: CIRCLE / 2,
                    borderWidth: 1,
                    borderColor: activePrimary,
                    backgroundColor: isFilled ? activePrimary : '#FFFFFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <IconComp
                    size={24}
                    bgColor={isFilled ? activePrimary : '#FFFFFF'}
                    iconColor={isFilled ? '#FFFFFF' : activePrimary}
                  />
                </View>
                <View style={{width: CIRCLE, height: 28, marginTop: 2}}>
                  <Text
                    numberOfLines={2}
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: LABEL_WIDTH,
                      left: (CIRCLE - LABEL_WIDTH) / 2,
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 10,
                      color: labelColor,
                    }}
                  >
                    {config.labels[index]}
                  </Text>
                </View>
              </View>

              {/* connector: 左侧步骤 DONE 后为实橙，否则浅橙；被拒整条灰 */}
              {index < config.states.length - 1 && (
                <View
                  style={{
                    flex: 1,
                    height: LINE,
                    marginHorizontal: 8,
                    marginTop: CIRCLE / 2 - LINE / 2,
                    backgroundColor: isRejectedStep
                      ? LINE_GRAY
                      : stepState === 'DONE'
                      ? activePrimary
                      : LINE_ORANGE_LIGHT,
                    borderRadius: LINE / 2,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </CustomView>
    );
  }

  // ---- 旧用法：固定三步 + current 索引（向后兼容） ----
  const activeSteps = approved
    ? steps || DEFAULT_STEPS
    : REJECTED_DEFAULT_STEPS;
  const activePrimary = approved ? PRIMARY : REJECTED_PRIMARY;
  const activeLabelColor = approved ? LABEL_COLOR : REJECTED_PRIMARY;

  return (
    <CustomView row style={[{paddingVertical: 16}, style]}>
      {activeSteps.map((step, index) => (
        <Fragment key={step.key}>
          {/* step: circle + label, fixed width so labels never squeeze the line */}
          <View style={{width: CIRCLE, alignItems: 'center'}}>
            <View
              style={{
                width: CIRCLE,
                height: CIRCLE,
                borderRadius: CIRCLE / 2,
                borderWidth: 1,
                borderColor: activePrimary,
                backgroundColor: index <= current ? activePrimary : '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <step.icon
                size={24}
                bgColor={index <= current ? activePrimary : '#FFFFFF'}
                iconColor={index <= current ? '#FFFFFF' : activePrimary}
              />
            </View>
            <View style={{width: CIRCLE, height: 14, marginTop: 2}}>
              <Text
                numberOfLines={1}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: LABEL_WIDTH,
                  left: (CIRCLE - LABEL_WIDTH) / 2,
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 10,
                  color: activeLabelColor,
                }}
              >
                {step.label?.[approved ? current : 0]}
              </Text>
            </View>
          </View>

          {/* connector: skip after the last step, marginTop centers it on the circle */}
          {index < activeSteps.length - 1 && (
            <View
              style={{
                flex: 1,
                height: LINE,
                marginHorizontal: 8,
                marginTop: CIRCLE / 2 - LINE / 2,
                backgroundColor: index < current ? activePrimary : LINE_GRAY,
                borderRadius: LINE / 2,
              }}
            />
          )}
        </Fragment>
      ))}
    </CustomView>
  );
};

export default StepsIndicator;
