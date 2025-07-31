@@ .. @@
   const navigateToProfile = () => {
     triggerMediumHaptic();
-    router.push('/(tabs)/profile');
+    router.push('/profile');
   };
 
   if (loading) {
@@ .. @@
           <View style={styles.bottomSpacing} />
         </ScrollView>
       </View>
-
-      {/* Bottom Navigation */}
-      <View style={styles.bottomNavigation}>
-        <TouchableOpacity style={styles.navItem} onPress={navigateToHome}>
-          <HomeIcon size={24} color={Colors.text.muted} />
-          <Text style={styles.navText}>Accueil</Text>
-        </TouchableOpacity>
-        
-        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={navigateToSiddour}>
-          <View style={styles.activeNavBackground}>
-            <BookOpen size={24} color={Colors.white} fill={Colors.white} />
-          </View>
-          <Text style={[styles.navText, styles.activeNavText]}>Siddour</Text>
-        </TouchableOpacity>
-        
-        <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
-          <User size={24} color={Colors.text.muted} />
-          <Text style={styles.navText}>Profil</Text>
-        </TouchableOpacity>
-      </View>
-
     </SafeAreaView>
 
   );
@@ .. @@
   bottomSpacing: {
     height: 40,
   },
-  bottomNavigation: {
-    flexDirection: 'row',
-    backgroundColor: Colors.white,
-    paddingVertical: 12,
-    paddingHorizontal: 16,
-    borderTopWidth: 1,
-    borderTopColor: Colors.background,
-    elevation: 10,
-    shadowColor: '#000',
-    shadowOffset: { width: 0, height: -2 },
-    shadowOpacity: 0.1,
-    shadowRadius: 8,
-    position: 'absolute',
-    bottom: 0,
-    left: 0,
-    right: 0,
-    height: 80,
-  },
-  navItem: {
-    flex: 1,
-    alignItems: 'center',
-    justifyContent: 'center',
-  },
-  activeNavItem: {
-    alignItems: 'center',
-    justifyContent: 'center',
-  },
-  activeNavBackground: {
-    backgroundColor: Colors.primary,
-    borderRadius: 20,
-    paddingHorizontal: 16,
-    paddingVertical: 6,
-    alignItems: 'center',
-    justifyContent: 'center',
-    marginBottom: 4,
-  },
-  navText: {
-    fontSize: 11,
-    color: Colors.text.muted,
-    marginTop: 2,
-    fontWeight: '500',
-  },
-  activeNavText: {
-    color: Colors.primary,
-    fontWeight: '600',
-  },
   loadingText: {
     fontSize: 16,
     color: Colors.text.secondary,