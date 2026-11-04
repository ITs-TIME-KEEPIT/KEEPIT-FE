import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { Category } from '../../constants/clothing';
// Figma 822:9024 원본 실루엣. 입력하지 않은 실측의 선·라벨은 표시하지 않음.
const layers = {dress: [{ source: require('../../../assets/diagrams/26a7a.svg'), left: 103.25, top: 19.25, width: 119.5, height: 197.5 }, { source: require('../../../assets/diagrams/c259c.svg'), left: 132.49995, top: 109.49997, width: 61.0001, height: 3.00006 }],
top: [{ source: require('../../../assets/diagrams/ba5d6.svg'), left: 117.25, top: 21.25, width: 115.5, height: 175.5 }, { source: require('../../../assets/diagrams/a893b.svg'), left: 174.0, top: 65.5, width: 1.0, height: 131.0 }, { source: require('../../../assets/diagrams/0cce3.svg'), left: 175.5, top: 97.5, width: 5.0, height: 5.0 }, { source: require('../../../assets/diagrams/0cce3.svg'), left: 175.5, top: 127.5, width: 5.0, height: 5.0 }, { source: require('../../../assets/diagrams/0cce3.svg'), left: 175.5, top: 157.5, width: 5.0, height: 5.0 }],
pants: [{ source: require('../../../assets/diagrams/f18db.svg'), left: 123.25, top: 21.25, width: 79.5, height: 191.5 }, { source: require('../../../assets/diagrams/32831.svg'), left: 132.5, top: 31.0, width: 61.0, height: 1.0 }, { source: require('../../../assets/diagrams/f06a8.svg'), left: 161.75, top: 31.25, width: 1.5, height: 45.5 }]};
export default function SizeDiagram({ category }: { category: Category }) {
 const { width } = useWindowDimensions();
 const scale = Math.min(1, Math.max(0, width - 66) / 326);
 const selected = category === '원피스' ? layers.dress : category === '하의' ? layers.pants : layers.top;
 return <View style={{width:326 * scale, height:236 * scale, alignSelf:'center'}} accessibilityLabel={`${category} 실측 도식`}><View style={[styles.frame,{transform:[{scale}],transformOrigin:'top left'}]}>
  {selected.map((layer, index) => <Image key={index} source={layer.source} style={{position: 'absolute', left: layer.left, top: layer.top, width: layer.width, height: layer.height}} contentFit="contain" />)}
 </View></View>;
}
const styles = StyleSheet.create({frame: {width: 326, height: 236}});
