 "use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import supabase from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TransactionsSkeleton } from "@/app/components/skeletons";
