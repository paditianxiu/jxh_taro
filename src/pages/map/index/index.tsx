import { Image, Text, View } from '@tarojs/components'
import { useState } from 'react'
import { MaterialIcons } from 'taro-icons'
import { API_BASE_URL } from '@/services/jxhApi'
import { StandardPage } from '@/components/StandardPage'
import Taro from '@tarojs/taro'
import { getJxhShareMessage } from '@/utils/share'

type BuildingNode = {
  id: number
  name: string
  children?: BuildingNode[] | null
}

const buildingNodes: BuildingNode[] = [
  {
    id: 1215,
    name: '教学楼',
    children: [
      {
        id: 1216,
        name: '公共教学楼',
        children: [
          { id: 1222, name: '1号楼' },
          { id: 1223, name: '2号楼' },
          { id: 1224, name: '3号楼' }
        ]
      },
      {
        id: 1217,
        name: '理实教学楼',
        children: [
          { id: 1225, name: '1号楼' },
          { id: 1226, name: '2号楼' },
          { id: 1227, name: '3号楼' }
        ]
      },
      {
        id: 1218,
        name: '学院楼',
        children: [
          { id: 1228, name: '航空制造学院' },
          { id: 1229, name: '航空电子与信息学院' },
          { id: 1230, name: '机电与材料学院' },
          { id: 1231, name: '航空维修学院' },
          { id: 1232, name: '民航与低空经济学院' },
          { id: 1233, name: '航空智能装备学院' },
          { id: 1234, name: '核技术应用学院' },
          { id: 1235, name: '无人装备应用学院' },
          { id: 1236, name: '导弹学院' },
          { id: 1238, name: '实训楼' }
        ]
      },
      { id: 1283, name: '学生事务中心', children: null },
      { id: 1284, name: '行政楼', children: null }
    ]
  },
  {
    id: 1219,
    name: '宿舍区',
    children: [
      {
        id: 1239,
        name: '学生宿舍',
        children: [
          { id: 1244, name: '1A栋' },
          { id: 1245, name: '1B栋' },
          { id: 1246, name: '2A栋' },
          { id: 1247, name: '2B栋' },
          { id: 1248, name: '3A栋' },
          { id: 1271, name: '3B栋' },
          { id: 1272, name: '4栋' },
          { id: 1273, name: '5栋' },
          { id: 1274, name: '6栋' },
          { id: 1275, name: '7栋' },
          { id: 1276, name: '8A栋' },
          { id: 1277, name: '8B栋' },
          { id: 1278, name: '9A栋' },
          { id: 1279, name: '9B栋' },
          { id: 1280, name: '10A栋' },
          { id: 1281, name: '10B栋' },
          { id: 1282, name: '11栋' }
        ]
      },
      { id: 1241, name: '教师宿舍', children: null }
    ]
  },
  {
    id: 1220,
    name: '公共区',
    children: [
      { id: 1253, name: '蓝天剧院' },
      { id: 1254, name: '图书馆' },
      { id: 1255, name: '红星体育馆' },
      { id: 1256, name: 'A区食堂' },
      { id: 1257, name: 'C区食堂' }
    ]
  },
  {
    id: 1221,
    name: '南城实训区',
    children: [
      { id: 1258, name: '1号综合业务楼' },
      { id: 1259, name: '2号办公楼' },
      { id: 1260, name: '3号后勤保障楼' },
      { id: 1261, name: '4号维修中心' },
      { id: 1262, name: '5号机库' },
      { id: 1263, name: '6号变电站' },
      { id: 1264, name: '7号消防/特种车库' },
      { id: 1265, name: '8号水泵房' },
      { id: 1266, name: '9号污水处理站' },
      { id: 1267, name: '10号垃圾收集站' },
      { id: 1268, name: '11号安检用房' }
    ]
  }
]

function countLeafNodes(nodes: BuildingNode[]) {
  return nodes.reduce((total, node) => {
    if (!node.children?.length) {
      return total + 1
    }

    return total + countLeafNodes(node.children)
  }, 0)
}

function BuildingTreeNode({ node, level = 0 }: { node: BuildingNode; level?: number }) {
  const hasChildren = !!node.children?.length

  return (
    <View
      className='rounded-xl bg-white px-3 py-3'
      style={{ marginLeft: level ? `${level * 18}rpx` : '0' }}
    >
      <View className='flex items-center gap-2'>
        <View className={`w-7 h-7 rounded-full flex items-center justify-center ${hasChildren ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <MaterialIcons
            name={hasChildren ? 'business' : 'place'}
            size={16}
            color={hasChildren ? '#FFFFFF' : '#6B7280'}
          />
        </View>
        <View className='flex-1'>
          <Text className='block text-sm font-bold text-gray-900'>{node.name}</Text>
        </View>
        {hasChildren && (
          <Text className='text-xs font-bold text-gray-400'>{node.children?.length} 项</Text>
        )}
      </View>

      {hasChildren && (
        <View className='flex flex-col gap-2 mt-3'>
          {node.children?.map(child => (
            <BuildingTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </View>
      )}
    </View>
  )
}

export default function MapPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const buildingCount = countLeafNodes(buildingNodes)

  return (
    <StandardPage title='江航地图' subtitle='校园建筑与道路位置'>
      <View className='flex flex-col gap-4'>
        <View className='rounded-2xl bg-gray-900 px-5 py-5'>
          <Text className='block text-xl font-bold text-white mb-1'>校园地图</Text>
          <Text className='block text-xs text-gray-300 leading-relaxed'>
            默认不加载地图图片，点击后再打开完整校园地图。
          </Text>

          <View
            className='rounded-full bg-white px-4 py-3 mt-5 flex flex-row items-center justify-center gap-2'
            onTap={() => {
              Taro.previewImage({
                urls: [
                  `${API_BASE_URL}/public/map.jpg`
                ]
              })
            }}
          >
            <MaterialIcons name='map' size={20} color='#111827' />
            <Text className='text-sm font-bold text-gray-900'>打开地图</Text>
          </View>
        </View>


        <View>
          <View className='flex items-center justify-between mb-3'>
            <Text className='text-sm font-bold text-gray-900'>建筑物列表</Text>
            <Text className='text-xs text-gray-400'>{buildingCount} 个地点</Text>
          </View>

          <View className='flex flex-col gap-3'>
            {buildingNodes.map(node => (
              <BuildingTreeNode key={node.id} node={node} />
            ))}
          </View>
        </View>
      </View>
    </StandardPage>
  )
}
