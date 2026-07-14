import { Text, View } from '@tarojs/components'
import { MaterialIcons } from 'taro-icons'

type StatItem = {
  value: string
  label: string
  tone: string
}

type FeatureItem = {
  icon: string
  title: string
  color: string
  surface: string
}

type CampusItem = {
  icon: string
  title: string
  detail: string
  color: string
  surface: string
}

type TimelineItem = {
  year: string
  title: string
  detail: string
}

const schoolStats: StatItem[] = [
  {
    value: '1956',
    label: '办学源起',
    tone: '#2563EB'
  },
  {
    value: '33',
    label: '高职专业',
    tone: '#059669'
  },
  {
    value: '13',
    label: '教学单位',
    tone: '#7C3AED'
  },
  {
    value: '944',
    label: '专任教师',
    tone: '#DC2626'
  }
]

const schoolFeatures: FeatureItem[] = [
  {
    icon: 'camera-roll ',
    title: '定向培养军士试点院校',
    color: '#2563EB',
    surface: '#EFF6FF'
  },
  {
    icon: 'format-paint',
    title: '现代学徒制试点院校',
    color: '#EA580C',
    surface: '#FFF7ED'
  },
  {
    icon: 'security',
    title: '国家级高技能人才培训基地',
    color: '#16A34A',
    surface: '#F0FDF4'
  },
  {
    icon: 'flight',
    title: '航空工业高技能人才培训基地',
    color: '#0891B2',
    surface: '#ECFEFF'
  }
]

const campusItems: CampusItem[] = [
  {
    icon: 'location-city',
    title: '南昌总部校区',
    detail: '南昌县迎宾南大道 872 号',
    color: '#2563EB',
    surface: '#EFF6FF'
  },
  {
    icon: 'memory',
    title: '抚州校区',
    detail: '抚州市东临新区灵谷峰大道 1 号',
    color: '#059669',
    surface: '#ECFDF5'
  },
  {
    icon: 'domain',
    title: '抚州校区规模',
    detail: '占地约 1306 亩，承载教学、住宿、文体等校园空间',
    color: '#7C3AED',
    surface: '#F5F3FF'
  }
]

const timelineItems: TimelineItem[] = [
  {
    year: '1956',
    title: '南昌四〇四业余工学院成立',
    detail: '学院办学脉络从航空工业职工教育中逐步发展。'
  },
  {
    year: '2004',
    title: '改设为江西航空职业技术学院',
    detail: '经批准设立为全日制普通高等职业院校。'
  },
  {
    year: '2015',
    title: '入选首批现代学徒制试点',
    detail: '强化校企协同培养，突出航空职业教育特色。'
  },
  {
    year: '2020',
    title: '办学性质调整',
    detail: '变更为民办非营利性高校，校名和隶属关系保持稳定。'
  },
  {
    year: '2025',
    title: '新校区建设与地址调整',
    detail: '南昌总部校区开工，办学地址扩展至南昌与抚州。'
  }
]

export default function HelpPanel() {
  return (
    <View className='pb-3'>
      <View className='mb-5'>
        <Text className='block text-lg font-bold text-gray-900'>江航档案</Text>
        <Text className='text-xs text-gray-500'>学校介绍、办学特色与校区信息</Text>
      </View>

      <View className='rounded-2xl bg-gray-900 px-4 py-5 mb-4 overflow-hidden'>
        <View className='flex items-start gap-3 mb-5'>
          <View className='w-12 h-12 rounded-2xl bg-white flex items-center justify-center'>
            <MaterialIcons name='flight' size={26} color='#111827' />
          </View>
          <View className='flex-1'>
            <Text className='block text-base font-bold text-white'>江西航空职业技术学院</Text>
            <Text className='text-[10px] text-gray-300'>Jiangxi Aviation Vocational and Technical College</Text>
          </View>
        </View>

        <Text className='block text-sm leading-6 text-gray-100'>
          学校位于江西南昌，是一所以航空制造、航空维修、电子信息、无人装备等方向为特色的全日制普通高职院校。
        </Text>
      </View>

      <View className='grid grid-cols-4 gap-2 mb-5'>
        {schoolStats.map(item => (
          <View
            key={item.label}
            className='rounded-xl bg-white px-2 py-3 border border-gray-100'
          >
            <Text className='block text-base font-black' style={{ color: item.tone }}>
              {item.value}
            </Text>
            <Text className='text-[10px] text-gray-500'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='flex items-center justify-between mb-3'>
        <Text className='text-sm font-bold text-gray-900'>办学特色</Text>
        <Text className='text-xs text-gray-400'>静态资料卡</Text>
      </View>

      <View className='grid grid-cols-2 gap-3 mb-5'>
        {schoolFeatures.map(item => (
          <View
            key={item.title}
            className='rounded-xl px-4 py-3'
            style={{ backgroundColor: item.surface }}
          >
            <View className='w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2'>
              <MaterialIcons name={item.icon} size={21} color={item.color} />
            </View>
            <Text className='text-xs font-semibold text-gray-900 leading-5'>{item.title}</Text>
          </View>
        ))}
      </View>

      <View className='rounded-2xl bg-white border border-gray-100 px-4 py-4 mb-5'>
        <View className='flex items-center gap-3 mb-3'>
          <View className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
            <MaterialIcons name='near-me' size={22} color='#2563EB' />
          </View>
          <View className='flex-1'>
            <Text className='block text-sm font-bold text-gray-900'>校训</Text>
            <Text className='text-xs text-gray-500'>学以知道、教以成德</Text>
          </View>
        </View>
        <Text className='block text-xs leading-5 text-gray-500'>
          以航空职业教育为底色，强调知行结合、技能成长与职业品格培养。
        </Text>
      </View>

      <View className='flex items-center justify-between mb-3'>
        <Text className='text-sm font-bold text-gray-900'>校区概览</Text>
        <Text className='text-xs text-gray-400'>南昌 / 抚州</Text>
      </View>

      <View className='flex flex-col gap-3 mb-5'>
        {campusItems.map(item => (
          <View
            key={item.title}
            className='flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3'
          >
            <View
              className='w-10 h-10 rounded-full flex items-center justify-center'
              style={{ backgroundColor: item.surface }}
            >
              <MaterialIcons name={item.icon} size={21} color={item.color} />
            </View>
            <View className='flex-1'>
              <Text className='block text-sm font-semibold text-gray-900'>{item.title}</Text>
              <Text className='text-xs leading-5 text-gray-500'>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='flex items-center justify-between mb-3'>
        <Text className='text-sm font-bold text-gray-900'>发展沿革</Text>
        <Text className='text-xs text-gray-400'>简版时间线</Text>
      </View>

      <View className='rounded-2xl bg-white border border-gray-100 px-4 py-4'>
        {timelineItems.map((item, index) => (
          <View key={item.year} className='flex gap-3'>
            <View className='items-center flex flex-col'>
              <View className='w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center'>
                <Text className='text-[10px] font-bold text-white'>{index + 1}</Text>
              </View>
              {index < timelineItems.length - 1 && (
                <View className='w-px flex-1 bg-gray-200' />
              )}
            </View>
            <View className='flex-1 pb-4'>
              <Text className='block text-xs font-bold text-blue-600'>{item.year}</Text>
              <Text className='block text-sm font-semibold text-gray-900 mt-1'>{item.title}</Text>
              <Text className='text-xs leading-5 text-gray-500'>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
