@@ .. @@
   const navigateToProfile = () => {
     triggerMediumHaptic();
-    router.push('/(tabs)/profile');
+    router.push('/profile');
   };
 
   const handlePreviousSubcategory = async () => {
@@ .. @@
         </View>
       </View>

-      {/* Subcategory Navigation */}
-      {subcategories.length > 1 && (
-        <View style={styles.subcategoryNavigation}>
-          <TouchableOpacity 
-            style={[
-              styles.navButton,
-              selectedSubcategoryIndex === 0 && styles.navButtonDisabled
-            ]}
-            onPress={handlePreviousSubcategory}
-            disabled={selectedSubcategoryIndex === 0}
-          >
-            <ChevronLeft 
-              size={20} 
-              color={selectedSubcategoryIndex === 0 ? Colors.text.muted : Colors.text.primary} 
-            />
-            <Text style={[
-              styles.navButtonText,
-              selectedSubcategoryIndex === 0 && styles.navButtonTextDisabled
-            ]}>
-              Précédent
-            </Text>
-          </TouchableOpacity>
-          
-          <View style={styles.navIndicator}>
-            <Text style={styles.navIndicatorText}>
-              {selectedSubcategoryIndex + 1} / {subcategories.length}
-            </Text>
-          </View>
-          
-          <TouchableOpacity 
-            style={[
-              styles.navButton,
-              selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonDisabled
-            ]}
-            onPress={handleNextSubcategory}
-            disabled={selectedSubcategoryIndex === subcategories.length - 1}
-          >
-            <Text style={[
-              styles.navButtonText,
-              selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonTextDisabled
-            ]}>
-              Suivant
-            </Text>
-            <ChevronRight 
-              size={20} 
-              color={selectedSubcategoryIndex === subcategories.length - 1 ? Colors.text.muted : Colors.text.primary} 
-            />
-          </TouchableOpacity>
-        </View>
-      )}
-
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
+        {/* Subcategory Navigation */}
+        {subcategories.length > 1 && (
+          <View style={styles.subcategoryNavigation}>
+            <TouchableOpacity 
+              style={[
+                styles.navButton,
+                selectedSubcategoryIndex === 0 && styles.navButtonDisabled
+              ]}
+              onPress={handlePreviousSubcategory}
+              disabled={selectedSubcategoryIndex === 0}
+            >
+              <ChevronLeft 
+                size={20} 
+                color={selectedSubcategoryIndex === 0 ? Colors.text.muted : Colors.text.primary} 
+              />
+              <Text style={[
+                styles.navButtonText,
+                selectedSubcategoryIndex === 0 && styles.navButtonTextDisabled
+              ]}>
+                Précédent
+              </Text>
+            </TouchableOpacity>
+            
+            <View style={styles.navIndicator}>
+              <Text style={styles.navIndicatorText}>
+                {selectedSubcategoryIndex + 1} / {subcategories.length}
+              </Text>
+            </View>
+            
+            <TouchableOpacity 
+              style={[
+                styles.navButton,
+                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonDisabled
+              ]}
+              onPress={handleNextSubcategory}
+              disabled={selectedSubcategoryIndex === subcategories.length - 1}
+            >
+              <Text style={[
+                styles.navButtonText,
+                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonTextDisabled
+              ]}>
+                Suivant
+              </Text>
+              <ChevronRight 
+                size={20} 
+                color={selectedSubcategoryIndex === subcategories.length - 1 ? Colors.text.muted : Colors.text.primary} 
+              />
+            </TouchableOpacity>
+          </View>
+        )}
+      </View>
 
       {/* Mini Audio Player */}
       {currentPlayingBlockId && (
@@ .. @@
   subcategoryNavigation: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     backgroundColor: 'transparent',
     paddingVertical: 12,
     paddingHorizontal: 16,
     position: 'absolute',
-    bottom: 80,
+    bottom: 20,
     left: 0,
     right: 0,
     height: 60,
@@ .. @@
   miniPlayer: {
     position: 'absolute',
-    bottom: 80,
+    bottom: 20,
     left: 0,
     right: 0,
     backgroundColor: Colors.white,
@@ .. @@
     marginLeft: 8,
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
   alternativeContainer: {
     backgroundColor: '#F3E8FF', // Fond violet clair
     borderWidth: 2,