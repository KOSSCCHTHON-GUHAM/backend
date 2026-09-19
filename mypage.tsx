import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// 지금은 예시 데이터예요. 나중에 백엔드 API에서 받아온 값으로 바꾸면 돼요.
const user = {
  name: "유진(yujin_dev)",
  initial: "유",
  tags: ["Frontend", "UI/UX"],
  stats: [
    { value: 3, label: "작성 포스팅" },
    { value: 4, label: "관심 분야" },
    { value: 7, label: "지원 현황" },
  ],
  interests: ["IT/AI", "창업", "디자인", "ESG"],
};

const posts = [
  { id: 1, title: "AI 기반 탄소발자국 측정 앱", meta: "IT/AI · 모집 2/4명" },
  { id: 2, title: "대학생 중고거래 커뮤니티 플랫폼", meta: "창업 · 모집 1/3명" },
];

// 하단 탭: 나중에 Expo Router의 진짜 탭 이동으로 바꿀 자리예요.
const tabs = [
  { label: "홈", icon: "home-outline" },
  { label: "포스팅", icon: "add" },
  { label: "채팅", icon: "chatbubble-outline" },
  { label: "마이", icon: "person" },
] as const;

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.smallButton} onPress={onPress}>
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function MyPage() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.header}>마이</Text>

          {/* 프로필 */}
          <View style={styles.section}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.initial}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user.name}</Text>
                <View style={styles.row}>
                  {user.tags.map((tag) => (
                    <View key={tag} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <SmallButton label="수정" onPress={() => {}} />
            </View>

            <View style={styles.statsRow}>
              {user.stats.map((stat, index) => (
                <View
                  key={stat.label}
                  style={[styles.statItem, index > 0 && styles.statDivider]}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 관심 분야 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>관심 분야</Text>
            <View style={styles.row}>
              {user.interests.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 내가 작성한 포스팅 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내가 작성한 포스팅</Text>
            {posts.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postMeta}>{post.meta}</Text>
                </View>
                <View style={styles.row}>
                  <SmallButton label="수정" onPress={() => {}} />
                  <SmallButton label="삭제" onPress={() => {}} />
                </View>
              </View>
            ))}
          </View>

          {/* 로그아웃 */}
          <Pressable style={[styles.section, styles.logoutRow]} onPress={() => {}}>
            <Text style={styles.logoutText}>로그아웃</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>
        </ScrollView>

        {/* 하단 탭 */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.label === "마이";
            return (
              <Pressable key={tab.label} style={styles.tabItem}>
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={active ? "#F0B36B" : "#999"}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  // 웹 브라우저에서 볼 때도 폰 너비처럼 보이게 제한해요.
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: "#F5F5F5",
  },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 10 },

  // 프로필
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F6D68F",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "bold" },
  profileInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  skillTag: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  skillTagText: { fontSize: 11, color: "#1E88E5", fontWeight: "600" },

  // 숫자 통계
  statsRow: { flexDirection: "row", marginTop: 20 },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: "#EEEEEE" },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 4 },

  // 관심 분야 칩
  chip: {
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipText: { fontSize: 11, color: "#555" },

  // 내가 작성한 포스팅
  postItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  postInfo: { flex: 1, marginRight: 8 },
  postTitle: { fontSize: 13, fontWeight: "bold" },
  postMeta: { fontSize: 11, color: "#888", marginTop: 4 },

  // 작은 버튼 (수정 / 삭제)
  smallButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
    backgroundColor: "#FFFFFF",
  },
  smallButtonText: { fontSize: 11, color: "#444" },

  // 로그아웃
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutText: { fontSize: 13, color: "#666" },

  // 하단 탭
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, color: "#999", marginTop: 2 },
  tabLabelActive: { color: "#F0B36B" },
});
