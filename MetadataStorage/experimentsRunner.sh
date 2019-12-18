#!/bin/sh
for UPPER_BOUND_FEATURES_IN_G in 5 10 20
do
	for N_EDGES_IN_QUERY in 2 4 6 8 10 12
	do
		for N_WRAPPERS in 2 4 8 16 32 64 128
		do
			for N_EDGES_COVERED_BY_WRAPPERS in 2 4 6 8 10 12
			do 		
				if [ $N_EDGES_COVERED_BY_WRAPPERS -le $N_EDGES_IN_QUERY ]; then
					for COVERED_FEATURES_QUERY in 0.3 0.6 0.9 #0.2 0.4 0.6 0.8 1
					do
						for COVERED_FEATURES_WRAPPER in 0.3 0.6 0.9 #0.2 0.4 0.6 0.8 1
						do
							timeout 10m java -jar build/libs/ODIN-1.0.jar 50 $UPPER_BOUND_FEATURES_IN_G $N_EDGES_IN_QUERY $N_WRAPPERS $N_EDGES_COVERED_BY_WRAPPERS $COVERED_FEATURES_QUERY $COVERED_FEATURES_WRAPPER
							sysctl -w vm.drop_caches=3 > /dev/null #free memory
							sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null #free memory
							timeout 10m java -jar build/libs/ODIN-1.0.jar 50 $UPPER_BOUND_FEATURES_IN_G $N_EDGES_IN_QUERY $N_WRAPPERS $N_EDGES_COVERED_BY_WRAPPERS $COVERED_FEATURES_QUERY $COVERED_FEATURES_WRAPPER
							sysctl -w vm.drop_caches=3 > /dev/null #free memory
							sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null #free memory
							timeout 10m java -jar build/libs/ODIN-1.0.jar 50 $UPPER_BOUND_FEATURES_IN_G $N_EDGES_IN_QUERY $N_WRAPPERS $N_EDGES_COVERED_BY_WRAPPERS $COVERED_FEATURES_QUERY $COVERED_FEATURES_WRAPPER
							sysctl -w vm.drop_caches=3 > /dev/null #free memory
							sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null #free memory
						done
					done
				fi
			done
		done
	done
done
