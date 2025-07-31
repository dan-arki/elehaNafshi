@@ .. @@
         default:
           // Pour les prières du Siddour (chaharit, minha, arvit, etc.)
           if (chapterId) {
-            router.replace(`/chapter/${chapterId}?subcategoryId=${originalId}`);
+            router.replace(`/(tabs)/siddour/chapter/${chapterId}?subcategoryId=${originalId}`);
           } else {
             setError('Impossible de localiser cette prière dans le Siddour');
             setLoading(false);
@@ .. @@
         case 'kever':
-          router.replace(`/kever/${originalId}`);
+          router.replace(`/(tabs)/index/kever/${originalId}`);
           break;
           
         case 'custom':
-          router.replace(`/custom-prayer/${originalId}`);
+          router.replace(`/(tabs)/profile/custom-prayer/${originalId}`);
           break;
           
         default: